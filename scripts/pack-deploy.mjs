#!/usr/bin/env node
/**
 * Empacota o export estático (out/) no zip que sobe na HostGator.
 *
 * Os arquivos ficam na RAIZ do zip — é assim que o "Extract" do cPanel espera,
 * já que o conteúdo vai direto para public_html. O `.htaccess` precisa entrar
 * junto (404, gzip e cache dependem dele).
 *
 *   npm run deploy      # build + zip
 *   node scripts/pack-deploy.mjs
 *
 * Por que NÃO usamos `Compress-Archive` do PowerShell: ele grava os caminhos
 * internos com barra INVERTIDA (`models\arquivo.glb`). O spec do ZIP exige
 * barra normal, e o extrator do cPanel (Linux/PHP) criaria arquivos com "\" no
 * nome em vez de pastas — o site subiria quebrado. O `tar.exe` do Windows é o
 * bsdtar/libarchive e grava certo.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { resolve } from "node:path";

const OUT = resolve("out");
const ZIP = resolve("comautomacao-site-export.zip");

if (!existsSync(OUT)) {
  console.error("out/ não existe — rode `npm run build` antes.");
  process.exit(1);
}

if (!existsSync(resolve(OUT, ".htaccess"))) {
  console.error(
    "out/.htaccess não encontrado. Ele vem de public/.htaccess e é o que\n" +
      "configura 404, gzip e cache no Apache. Abortando para não subir sem ele.",
  );
  process.exit(1);
}

if (existsSync(ZIP)) rmSync(ZIP);

// nomes do primeiro nível (readdir inclui dotfiles): entram na raiz do zip
const entries = readdirSync(OUT);
const isWindows = process.platform === "win32";

/*
 * Caminho absoluto de propósito: num shell tipo Git Bash o `tar` do PATH é o
 * GNU tar, que não escreve zip ("Invalid archive format"). O que interessa é o
 * bsdtar que vem no Windows.
 */
const BSDTAR = resolve(process.env.SystemRoot ?? "C:\\Windows", "System32", "tar.exe");

if (isWindows && !existsSync(BSDTAR)) {
  console.error(`bsdtar não encontrado em ${BSDTAR} (esperado no Windows 10+).`);
  process.exit(1);
}

const TAR = isWindows ? BSDTAR : "tar";

const pack = isWindows
  ? spawnSync(TAR, ["-c", "-f", ZIP, "--format", "zip", "-C", OUT, ...entries], {
      stdio: "inherit",
    })
  : spawnSync("zip", ["-r", "-q", ZIP, "."], { cwd: OUT, stdio: "inherit" });

if (pack.status !== 0) {
  console.error("falha ao gerar o zip");
  process.exit(pack.status ?? 1);
}

// Guarda-corpo: relista o arquivo e confere que nenhum caminho saiu com barra
// invertida e que o .htaccess está lá. Vale mais errar aqui do que no cPanel.
const list = spawnSync(TAR, ["-tf", ZIP], { encoding: "utf8" });
if (list.status === 0) {
  // split por \r?\n: no Windows as linhas vêm com CR e ele entraria no nome
  const paths = list.stdout.split(/\r?\n/).filter(Boolean);
  const backslashes = paths.filter((p) => p.includes("\\"));
  if (backslashes.length > 0) {
    console.error(
      `\n${backslashes.length} caminho(s) com barra invertida no zip — o cPanel\n` +
        "extrairia isso como nome de arquivo, não como pasta. Exemplo: " +
        backslashes[0],
    );
    process.exit(1);
  }
  if (!paths.includes(".htaccess")) {
    console.error("\n.htaccess não entrou no zip.");
    process.exit(1);
  }
  console.log(`\n${paths.length} entradas · caminhos verificados`);
}

const mb = (statSync(ZIP).size / 1048576).toFixed(1);
console.log(
  `\npacote de deploy: comautomacao-site-export.zip (${mb} MB)\n\n` +
    "cPanel → Gerenciador de Arquivos → public_html:\n" +
    "  Upload do zip → Extract ali mesmo (sobrescrevendo) → apagar o zip.\n\n" +
    "NÃO limpe o public_html antes de extrair: entre apagar e terminar de\n" +
    "extrair o site fica quebrado para quem acessa (HTML pela metade vira\n" +
    "ERR_CONTENT_DECODING_FAILED, e arquivos ainda não extraídos viram 404).\n" +
    "Extrair por cima é seguro — JS, CSS e modelos têm hash no nome.",
);
