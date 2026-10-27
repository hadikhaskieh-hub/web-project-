#!/usr/bin/env bash
# Rebuilds the 30s vertical intro: frames (Playwright) + music (numpy) -> H.264/AAC MP4.
set -euo pipefail
cd "$(dirname "$0")"
export OUT="${OUT:-$(pwd)/../build}"
mkdir -p "$OUT"

python3 music.py "$OUT/music.wav"
rm -rf "$OUT/frames" && node render.js frames

ffmpeg -hide_banner -loglevel error -y \
  -framerate 30 -i "$OUT/frames/f%04d.png" -i "$OUT/music.wav" \
  -af "loudnorm=I=-14:TP=-1.5:LRA=7" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -tune animation \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest \
  ../taqareer-intro-30s-9x16.mp4

# cover image for the Reel (logo frame)
ffmpeg -hide_banner -loglevel error -y -i "$OUT/frames/f0870.png" -q:v 2 ../taqareer-intro-cover.jpg
echo "done -> ../taqareer-intro-30s-9x16.mp4"
