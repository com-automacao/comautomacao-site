// Extrai frames de um vídeo para a sequência usada no efeito scroll-sync
// (componente ScrollVideo). Usa ffmpeg/ffprobe.
//
// Uso:
//   node scripts/extract-scroll-frames.mjs <video> [frames=90] [largura=1920] [pasta=scroll] [crop=w:h:x:y]
//
// Saída: public/products/desenvolvimento-web/<pasta>/frame-0001.webp ...
// O crop opcional (ex.: "1728:2160:1056:0") recorta antes do scale — útil para
// gerar uma versão retrato (mobile) centrada na logo.
// Depois de rodar, ajuste o frameCount da <ScrollVideo /> para o total impresso.

import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const [input, countArg, widthArg, outArg, cropArg] = process.argv.slice(2);
if (!input) {
  console.error(
    "Uso: node scripts/extract-scroll-frames.mjs <video> [frames=90] [largura=1920] [pasta=scroll] [crop=w:h:x:y]",
  );
  process.exit(1);
}

const FRAMES = Number(countArg) || 90;
const WIDTH = Number(widthArg) || 1920;
const OUT = resolve(
  `public/products/desenvolvimento-web/${outArg || "scroll"}`,
);

const duration = Number(
  execFileSync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=nokey=1:noprint_wrappers=1",
    input,
  ])
    .toString()
    .trim(),
);

if (!duration || Number.isNaN(duration)) {
  console.error("Não consegui ler a duração do vídeo.");
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const fps = FRAMES / duration;

console.log(
  `Vídeo: ${input}\nDuração: ${duration.toFixed(2)}s · alvo: ${FRAMES} frames @ ${WIDTH}px (fps=${fps.toFixed(3)})`,
);

execFileSync(
  "ffmpeg",
  [
    "-y",
    "-i",
    input,
    "-vf",
    `fps=${fps}${cropArg ? `,crop=${cropArg}` : ""},scale=${WIDTH}:-2:flags=lanczos`,
    "-frames:v",
    String(FRAMES),
    "-c:v",
    "libwebp",
    "-q:v",
    "82",
    "-compression_level",
    "6",
    join(OUT, "frame-%04d.webp"),
  ],
  { stdio: "inherit" },
);

const files = readdirSync(OUT).filter((f) => f.endsWith(".webp"));
const totalMB =
  files.reduce((s, f) => s + statSync(join(OUT, f)).size, 0) / 1024 / 1024;

console.log(
  `\n✓ ${files.length} frames gerados em ${OUT}\n  Peso total: ${totalMB.toFixed(1)} MB\n  → defina frameCount={${files.length}} na <ScrollVideo />`,
);
