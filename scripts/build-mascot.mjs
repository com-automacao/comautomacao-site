#!/usr/bin/env node
/**
 * Prepara o GLB do mascote astronauta para a web.
 *
 * O arquivo que sai do Meshy é inviável em produção (~17MB, 288.776 triângulos,
 * textura PNG de 5,7MB) e vem com o material errado. Este script resolve as
 * duas coisas e gera as versões que o site consome, preservando o rig
 * (Hips → Spine → neck → Head → braços), que é o que as interações usam.
 *
 *   node scripts/build-mascot.mjs <arquivo-fonte.glb>
 *
 * Etapas:
 *   1. desempacota o GLB (textura vira arquivo solto)
 *   2. reescreve o AZUL dos detalhes para um tom mais escuro
 *   3. gera um mapa de METALLIC-ROUGHNESS a partir do albedo — é o que dá
 *      acabamentos diferentes para visor, traje e anéis
 *   4. corrige o material no próprio asset (emissivo e metalness do Meshy)
 *   5. simplifica, comprime e empacota as duas variantes
 *
 * Saída (em public/models/):
 *   com-automation-astronaut.glb         desktop · 58.624 tri · textura 2048
 *   com-automation-astronaut-mobile.glb  mobile   · 17.326 tri · textura 1024
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { resolve, join } from "node:path";
import sharp from "sharp";

const source = process.argv[2];

if (!source || !existsSync(source)) {
  console.error(
    "uso: node scripts/build-mascot.mjs <arquivo-fonte.glb>\n" +
      "     (o GLB cru do Meshy; ele NÃO deve ser commitado — ver .gitignore)",
  );
  process.exit(1);
}

const WORK = resolve("mascot-src/.build");
const mb = (p) => (statSync(p).size / 1048576).toFixed(2) + " MB";

const gltfTransform = (...args) => {
  const run = spawnSync("npx", ["--yes", "@gltf-transform/cli@4", ...args], {
    stdio: ["inherit", "pipe", "inherit"],
    shell: process.platform === "win32",
    encoding: "utf8",
  });
  if (run.status !== 0) {
    console.error("gltf-transform falhou");
    process.exit(run.status ?? 1);
  }
  return run.stdout ?? "";
};

/* ------------------------------------------------------------------ *
 * COR DOS DETALHES
 *
 * O azul não é material, é pintura na textura — só dá para mudar aqui.
 * A transformação é relativa (não uma cor chapada) para preservar o
 * sombreamento que já vem pintado: o realce continua realce, a dobra
 * continua dobra, tudo mais escuro e mais azul.
 *
 * Origem: H≈200 S≈0.62 L≈0.53 (azul-ciano claro).
 * ------------------------------------------------------------------ */
const BLUE = {
  // faixa de matiz considerada "azul" na textura de origem
  hueFrom: 170,
  hueTo: 250,
  // abaixo de satLow nada muda; acima de satHigh muda por inteiro. A rampa
  // entre os dois evita uma borda dura na máscara.
  satLow: 0.16,
  satHigh: 0.32,
  /*
   * Ganho por canal, e não conversão para HSL.
   *
   * A primeira versão convertia cada pixel RGB→HSL→RGB. Funcionava, mas o
   * arredondamento de volta para 8 bits espalhava ruído de quantização por
   * 20% da imagem e o WebP dobrava de tamanho (0,27MB → 0,54MB) sem nenhuma
   * diferença visual que justificasse. Ganho por canal é uma operação linear:
   * o gradiente continua liso e o arquivo, do mesmo tamanho.
   *
   * Calculado do azul médio de origem (#3c9ed1) para o alvo (#1a5c9e).
   */
  gain: [26 / 60, 92 / 158, 158 / 209],
};

const smoothstep = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const rgbToHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
};

const hslToRgb = (h, s, l) => {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb;
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return rgb.map((v) => Math.round(Math.max(0, Math.min(1, v + m)) * 255));
};

/* ------------------------------------------------------------------ *
 * ACABAMENTO POR REGIÃO
 *
 * O modelo tem um material só, então visor, traje e anéis brilhavam
 * igual. Aqui o albedo é usado para classificar cada pixel e escrever um
 * mapa de rugosidade — no glTF, o canal G é rugosidade e o B é metalness.
 * ------------------------------------------------------------------ */
const ROUGHNESS = {
  visor: 0.1, // vidro escuro: reflexo nítido
  detalhe: 0.28, // anéis azuis e botão: plástico polido
  traje: 0.62, // tecido técnico: reflexo largo e macio
};

/** o mapa de acabamento não precisa da resolução do albedo (ver abaixo) */
const ORM_SIZE = 512;

/** qualidade do WebP — explícita de propósito (ver o passo de codificação) */
const WEBP_QUALITY = 82;

console.log(`fonte: ${source} (${mb(source)})\n`);

rmSync(WORK, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });

console.log("1/5 desempacotando…");
gltfTransform("copy", resolve(source), join(WORK, "cosmo.gltf"));

const albedoPath = join(WORK, "baseColor.png");
if (!existsSync(albedoPath)) {
  console.error(
    `esperava a textura em ${albedoPath}. Se o nome mudou, ajuste aqui — a\n` +
      "textura é escrita pelo `gltf-transform copy` com o nome do slot.",
  );
  process.exit(1);
}

console.log("2/5 reescrevendo o azul dos detalhes…");
const { data: src, info } = await sharp(albedoPath)
  .raw()
  .toBuffer({ resolveWithObject: true });

const px = info.width * info.height;
const ch = info.channels;
const albedo = Buffer.alloc(px * 3);
const orm = Buffer.alloc(px * 3);
let recolored = 0;

for (let i = 0; i < px; i++) {
  const o = i * ch;
  let r = src[o];
  let g = src[o + 1];
  let b = src[o + 2];

  const [h, s] = rgbToHsl(r, g, b);
  const w =
    h >= BLUE.hueFrom && h <= BLUE.hueTo
      ? smoothstep(BLUE.satLow, BLUE.satHigh, s)
      : 0;

  if (w > 0) {
    r = Math.round(r * (1 - w + w * BLUE.gain[0]));
    g = Math.round(g * (1 - w + w * BLUE.gain[1]));
    b = Math.round(b * (1 - w + w * BLUE.gain[2]));
    recolored++;
  }

  albedo[i * 3] = r;
  albedo[i * 3 + 1] = g;
  albedo[i * 3 + 2] = b;

  // classificação para o acabamento, sobre a cor JÁ corrigida
  const [, s2, l2] = rgbToHsl(r, g, b);
  let rough;
  if (s2 < 0.16 && l2 < 0.34) rough = ROUGHNESS.visor;
  else if (s2 < 0.16) rough = ROUGHNESS.traje;
  else rough = ROUGHNESS.detalhe;

  orm[i * 3] = 255; // R: oclusão (não usada — a do Meshy já vem no albedo)
  orm[i * 3 + 1] = Math.round(rough * 255); // G: rugosidade
  orm[i * 3 + 2] = 0; // B: metalness — traje é dielétrico
}

console.log(
  `      ${((recolored / px) * 100).toFixed(1)}% dos pixels eram azul e foram reescritos`,
);

await sharp(albedo, { raw: { width: info.width, height: info.height, channels: 3 } })
  .png()
  .toFile(albedoPath);

console.log("3/5 gerando o mapa de acabamento…");
const ormPath = join(WORK, "metallicRoughness.png");
/*
 * 512² e desfocado, de propósito. São três valores chapados em áreas grandes:
 * na resolução do albedo o arquivo custava ~0,44MB só de bordas duras, sem
 * ganho visual nenhum. O desfoque ainda suaviza a transição entre acabamentos,
 * que na borda dura aparecia como uma linha de brilho.
 */
await sharp(orm, { raw: { width: info.width, height: info.height, channels: 3 } })
  .resize(ORM_SIZE, ORM_SIZE, { kernel: "cubic" })
  .blur(1.2)
  .png({ palette: true })
  .toFile(ormPath);

/** o albedo é regravado no tamanho de cada variante antes de empacotar */
const writeAlbedo = (size) =>
  sharp(albedo, { raw: { width: info.width, height: info.height, channels: 3 } })
    .resize(size, size, { kernel: "lanczos3" })
    .png()
    .toFile(albedoPath);

console.log("4/5 corrigindo o material…");
const gltfPath = join(WORK, "cosmo.gltf");
const doc = JSON.parse(readFileSync(gltfPath, "utf8"));

doc.images ??= [];
doc.samplers ??= [];
doc.textures ??= [];

const albedoTexture = doc.materials[0].pbrMetallicRoughness.baseColorTexture;
const ormImage = doc.images.push({ uri: "metallicRoughness.png" }) - 1;
const ormTexture =
  doc.textures.push({
    source: ormImage,
    sampler: doc.textures[albedoTexture.index]?.sampler,
  }) - 1;

for (const material of doc.materials) {
  const pbr = (material.pbrMetallicRoughness ??= {});
  // o mapa passa a mandar; os fatores viram multiplicadores neutros
  pbr.metallicRoughnessTexture = { index: ormTexture };
  pbr.metallicFactor = 1;
  pbr.roughnessFactor = 1;
  /*
   * O Meshy exporta emissiveFactor [1,1,1] com a própria textura como mapa
   * emissivo: o modelo se auto-ilumina em cheio e nenhuma luz da cena tem
   * efeito. Zerado aqui, na origem, em vez de remendar em runtime.
   */
  material.emissiveFactor = [0, 0, 0];
  delete material.emissiveTexture;
  // malha fechada não precisa de dupla face
  material.doubleSided = false;
}

writeFileSync(gltfPath, JSON.stringify(doc));

console.log("5/5 otimizando e empacotando…\n");

const MODELS_DIR = resolve("public/models");

const targets = [
  {
    base: "com-automation-astronaut",
    label: "desktop",
    export: "DESKTOP_MODEL_URL",
    textureSize: 2048,
    ratio: "0.15",
    error: "0.0002",
  },
  {
    base: "com-automation-astronaut-mobile",
    label: "mobile",
    export: "MOBILE_MODEL_URL",
    textureSize: 1024,
    ratio: "0.06",
    error: "0.0012",
  },
];

const built = [];

for (const t of targets) {
  const out = join(WORK, `${t.base}.glb`);
  const encoded = join(WORK, `webp-${t.label}.gltf`);
  await writeAlbedo(t.textureSize);

  /*
   * TEXTURAS PRIMEIRO, malha depois — a ordem importa. Rodando o `webp` no
   * arquivo já otimizado, ele descomprime a geometria meshopt para reescrever
   * o arquivo e não a recomprime: a malha saltava de 0,45MB para 1,16MB.
   * O meshopt tem que ser o último passo.
   *
   * A codificação fica em passo separado (e não no `optimize`) para fixar a
   * QUALIDADE: o padrão do encoder muda conforme o formato de entrada, e o
   * mesmo albedo saía com 0,27MB por um caminho e 0,53MB por outro, sem
   * diferença visual que justificasse.
   */
  gltfTransform(
    "webp", gltfPath, encoded,
    "--quality", String(WEBP_QUALITY),
    "--effort", "95",
  );

  gltfTransform(
    "optimize",
    encoded,
    out,
    // meshopt em vez de draco: o decoder vem empacotado com o three, sem
    // depender de CDN de terceiros em runtime
    "--compress", "meshopt",
    // as texturas já estão codificadas acima
    "--texture-compress", "false",
    "--simplify", "true",
    "--simplify-ratio", t.ratio,
    "--simplify-error", t.error,
    // join/flatten quebrariam a malha com skin
    "--join", "false",
    "--flatten", "false",
  );

  built.push({ ...t, tmp: out });
}

/* ------------------------------------------------------------------ *
 * NOME COM HASH DO CONTEÚDO
 *
 * Arquivos em public/ mantêm o nome para sempre — só o JS/CSS do Next é
 * versionado. Com o nome fixo, quem já tinha o mascote em cache continuava
 * vendo o modelo ANTIGO depois de cada atualização, sem jeito de forçar.
 *
 * Com o hash no nome, o arquivo novo é uma URL nova: atualiza na hora para
 * todo mundo, e o antigo pode ser cacheado para sempre com segurança.
 * O componente lê os caminhos do manifesto gerado abaixo.
 * ------------------------------------------------------------------ */
mkdirSync(MODELS_DIR, { recursive: true });

// limpa versões anteriores para public/ não acumular modelos órfãos
for (const file of readdirSync(MODELS_DIR)) {
  if (/^com-automation-astronaut(-mobile)?\.[a-f0-9]{8}\.glb$/.test(file) ||
      /^com-automation-astronaut(-mobile)?\.glb$/.test(file)) {
    rmSync(join(MODELS_DIR, file));
  }
}

const manifest = [];
for (const t of built) {
  const bytes = readFileSync(t.tmp);
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 8);
  const name = `${t.base}.${hash}.glb`;
  writeFileSync(join(MODELS_DIR, name), bytes);
  manifest.push({ ...t, name });
  console.log(`${t.label.padEnd(8)} public/models/${name} (${mb(join(MODELS_DIR, name))})`);
}

writeFileSync(
  resolve("lib/mascot-model.ts"),
  `// GERADO por scripts/build-mascot.mjs — não edite à mão.\n` +
    `//\n` +
    `// O hash no nome é o que faz uma troca de modelo valer na hora: sem ele o\n` +
    `// arquivo em public/ mantém a mesma URL para sempre e quem já tinha o\n` +
    `// mascote em cache continuava vendo a versão antiga.\n` +
    manifest
      .map((m) => `export const ${m.export} = "/models/${m.name}";\n`)
      .join(""),
);

rmSync(WORK, { recursive: true, force: true });

console.log(
  "\nlib/mascot-model.ts atualizado com os novos caminhos.\n" +
    "Para mexer no tom do azul, ajuste BLUE no topo deste arquivo;\n" +
    "para o brilho de cada parte, ajuste ROUGHNESS.",
);
