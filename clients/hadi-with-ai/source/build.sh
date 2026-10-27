#!/usr/bin/env bash
# Rebuilds the 30s vertical reel: frames (Playwright) + beat (numpy) -> H.264/AAC MP4.
set -euo pipefail
cd "$(dirname "$0")"
export OUT="${OUT:-$(pwd)/../build}"
mkdir -p "$OUT"

python3 beat.py "$OUT/beat.wav"
rm -rf "$OUT/frames" && node render.js frames

ffmpeg -hide_banner -loglevel error -y \
  -framerate 30 -i "$OUT/frames/f%04d.png" -i "$OUT/beat.wav" \
  -af "loudnorm=I=-14:TP=-1.5:LRA=7" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -tune animation \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest \
  ../ai-killed-3-jobs-30s-9x16.mp4

# cover image for the Reel (the hook frame)
ffmpeg -hide_banner -loglevel error -y -i "$OUT/frames/f0045.png" -q:v 2 ../ai-killed-3-jobs-cover.jpg
echo "done -> ../ai-killed-3-jobs-30s-9x16.mp4"
