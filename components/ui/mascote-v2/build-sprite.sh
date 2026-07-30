#!/usr/bin/env bash
#
# build-sprite.sh v2
# Reduz o supersampling com Lanczos, monta a grade e codifica.
#
# A ordem importa: reduzir ANTES de montar preserva melhor a borda de cada
# frame, porque o filtro não cruza a fronteira entre frames vizinhos.
#
# Requisitos: ffmpeg, node com sharp
#
set -euo pipefail

SRC="${1:-sprites}"
OUT="${2:-public/mascote}"
RES="${RES:-640}"          # resolução final por frame
COLS="${COLS:-5}"          # precisa bater com COLS do render_sprites.py

FRAMES=$(find "$SRC" -name 'frame_*.png' | wc -l | tr -d ' ')
[ "$FRAMES" -eq 0 ] && { echo "Nenhum frame em $SRC." >&2; exit 1; }

ROWS=$(( (FRAMES + COLS - 1) / COLS ))
mkdir -p "$OUT" "$SRC/scaled"

echo "==> $FRAMES frames, grade ${COLS}x${ROWS}, ${RES}px por frame"

# ---------------------------------------------------------------------------
# 1. Downsample de cada frame, com Lanczos
# ---------------------------------------------------------------------------
echo "==> Reduzindo com Lanczos"
node --input-type=module -e "
import sharp from 'sharp';
import { readdir } from 'node:fs/promises';

const files = (await readdir('$SRC')).filter(f => /^frame_\d+\.png\$/.test(f)).sort();
for (const f of files) {
  await sharp('$SRC/' + f)
    .resize($RES, $RES, { kernel: 'lanczos3', fit: 'contain', background: { r:0,g:0,b:0,alpha:0 } })
    .png({ compressionLevel: 6 })
    .toFile('$SRC/scaled/' + f);
}
await sharp('$SRC/poster.png')
  .resize($RES, $RES, { kernel: 'lanczos3', fit: 'contain', background: { r:0,g:0,b:0,alpha:0 } })
  .png({ compressionLevel: 9 })
  .toFile('$SRC/scaled/poster.png');
console.log('    ' + files.length + ' frames reduzidos');
"

# ---------------------------------------------------------------------------
# 2. Montagem da grade
# ---------------------------------------------------------------------------
echo "==> Montando grade ${COLS}x${ROWS}"
ffmpeg -y -loglevel error \
  -framerate 1 -i "$SRC/scaled/frame_%02d.png" \
  -vf "tile=${COLS}x${ROWS}:padding=0:margin=0:color=#00000000" -frames:v 1 \
  "$SRC/sheet.png"

W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$SRC/sheet.png")
H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$SRC/sheet.png")
MEM=$(python3 -c "print(f'{$W*$H*4/1e6:.0f}')")
echo "    folha: ${W}x${H}px, ~${MEM} MB decodificados"

if [ "$W" -gt 16384 ] || [ "$H" -gt 16384 ]; then
  echo "ERRO: folha acima de 16384px. Aumente COLS ou reduza RES." >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# 3. Codificação
# ---------------------------------------------------------------------------
# Alfa é onde lossy costuma estragar. AVIF aqui usa alfa sem perda,
# e o WebP vai com alphaQuality 100. A fidelidade da silhueta importa
# mais que os poucos KB economizados.

echo "==> Codificando"
node --input-type=module -e "
import sharp from 'sharp';
const jobs = [
  ['$SRC/sheet.png',         '$OUT/sheet.avif',  'avif', { quality: 62, effort: 8, lossless: false }],
  ['$SRC/sheet.png',         '$OUT/sheet.webp',  'webp', { quality: 82, alphaQuality: 100, effort: 6 }],
  ['$SRC/scaled/poster.png', '$OUT/poster.avif', 'avif', { quality: 68, effort: 8 }],
  ['$SRC/scaled/poster.png', '$OUT/poster.webp', 'webp', { quality: 86, alphaQuality: 100, effort: 6 }],
  ['$SRC/scaled/poster.png', '$OUT/poster.png',  'png',  { compressionLevel: 9 }],
];
for (const [i, o, f, opt] of jobs) await sharp(i)[f](opt).toFile(o);
"

# ---------------------------------------------------------------------------
# 4. Relatório
# ---------------------------------------------------------------------------
echo ""
printf "%-22s %10s\n" "ARQUIVO" "TAMANHO"
for f in "$OUT"/*; do
  printf "%-22s %10s\n" "$(basename "$f")" "$(du -h "$f" | cut -f1)"
done

echo ""
echo "No componente:  <MascotSprite frames={$FRAMES} cols={$COLS} />"
echo ""
echo "Inspeção de fidelidade, antes de aceitar:"
echo "  1. Abra $OUT/sheet.avif a 200% e olhe a borda do visor."
echo "     Franja escura significa alfa mal codificado. Suba a quality do AVIF."
echo "  2. Compare poster.avif com o PNG de referência lado a lado."
echo "     Se o branco lavou, o view transform do Blender não estava em Standard."
