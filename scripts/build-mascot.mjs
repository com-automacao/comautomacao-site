#!/usr/bin/env node
/**
 * Prepara o GLB do mascote astronauta para a web.
 *
 * O arquivo que sai do Meshy é inviável em produção: ~17MB, 288.776 triângulos
 * e uma textura PNG de 5,69MB. Este script gera as duas versões que o site
 * consome, preservando o rig (Hips → Spine → neck → Head → braços), que é o que
 * as interações usam.
 *
 *   node scripts/build-mascot.mjs <arquivo-fonte.glb>
 *
 * Saída (em public/models/):
 *   com-automation-astronaut.glb         ~527KB · 58.624 tri · textura 1024
 *   com-automation-astronaut-mobile.glb  ~187KB · 14.438 tri · textura 512
 *
 * Requer apenas npx (baixa o @gltf-transform/cli sob demanda).
 */
import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";

const source = process.argv[2];

if (!source || !existsSync(source)) {
  console.error(
    "uso: node scripts/build-mascot.mjs <arquivo-fonte.glb>\n" +
      "     (o GLB cru do Meshy; ele NÃO deve ser commitado — ver .gitignore)",
  );
  process.exit(1);
}

const mb = (p) => (statSync(p).size / 1048576).toFixed(2) + " MB";

// A textura de origem é 2048². No desktop vale manter: o mascote é renderizado
// grande e a 1024 o visor e as faixas perdiam definição (custo: ~230KB).
const targets = [
  {
    out: "public/models/com-automation-astronaut.glb",
    label: "desktop",
    textureSize: "2048",
    ratio: "0.15",
    error: "0.0002",
  },
  {
    out: "public/models/com-automation-astronaut-mobile.glb",
    label: "mobile",
    textureSize: "1024",
    ratio: "0.06",
    error: "0.0012",
  },
];

console.log(`fonte: ${source} (${mb(source)})\n`);

for (const t of targets) {
  const out = resolve(t.out);
  const args = [
    "--yes",
    "@gltf-transform/cli@4",
    "optimize",
    resolve(source),
    out,
    // meshopt em vez de draco: o decoder vem empacotado com o three, sem
    // depender de CDN de terceiros em runtime.
    "--compress", "meshopt",
    "--texture-compress", "webp",
    "--texture-size", t.textureSize,
    "--simplify", "true",
    "--simplify-ratio", t.ratio,
    "--simplify-error", t.error,
    // join/flatten quebrariam a malha com skin
    "--join", "false",
    "--flatten", "false",
  ];

  const run = spawnSync("npx", args, { stdio: "inherit", shell: process.platform === "win32" });
  if (run.status !== 0) {
    console.error(`\nfalhou ao gerar a versão ${t.label}`);
    process.exit(run.status ?? 1);
  }
  console.log(`\n${t.label}: ${t.out} (${mb(out)})\n`);
}

console.log(
  "pronto. Se a silhueta ficou facetada demais, suba o --simplify-ratio do alvo\n" +
    "correspondente e rode de novo.",
);
