#!/usr/bin/env bash
# Rebuilds the handbag ad in 9:16 and 1:1 from the real photos (no AI generation).
#   ./build.sh <cutouts-dir>
# <cutouts-dir> holds the background-removed photos made with rembg (pip install rembg):
#   black-front / taupe-front / cognac-front with model birefnet-general-lite, black-back with birefnet-general,
#   saved as <photo>-<model>.png. Run one photo per process; the big model needs a lot of memory.
set -euo pipefail
cd "$(dirname "$0")"
CUT="${1:?pass the folder with the rembg cut-outs}"
export OUT="${OUT:-$(pwd)/../build}"
mkdir -p "$OUT"

python3 prep.py "$CUT"
python3 music.py "$OUT/music.wav"

for R in 9x16 1x1; do
  rm -rf "$OUT/frames-$R" && node render.js frames "$R"
  ffmpeg -hide_banner -loglevel error -y -framerate 30 -i "$OUT/frames-$R/f%04d.png" -i "$OUT/music.wav" -map 0:v -map 1:a \
    -af "loudnorm=I=-14:TP=-1.5:LRA=9" -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -profile:v high \
    -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest "../taihongyoupin-ad-$R.mp4"
done
ffmpeg -hide_banner -loglevel error -y -i "$OUT/frames-9x16/f0600.png" -q:v 2 ../taihongyoupin-ad-cover.jpg
echo done
