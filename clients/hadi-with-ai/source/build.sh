#!/usr/bin/env bash
# Rebuilds the 30s hadi.ai reel (keynote style) synced to "Doors Light Funk (Slowed)".
#   ./build.sh /path/to/song-or-video-with-the-song
# The song is NOT stored in the repo; pass the file you have. Without it, only the
# no-music version is built.
set -euo pipefail
cd "$(dirname "$0")"
export OUT="${OUT:-$(pwd)/../build}"
SONG="${1:-}"
SONG_START=17.5   # reel 0:00 = song 0:17.5, so the drop (song 0:25.0) kills Coding at reel 0:07.5
mkdir -p "$OUT"

rm -rf "$OUT/frames" && node render.js frames

ffmpeg -hide_banner -loglevel error -y -framerate 30 -i "$OUT/frames/f%04d.png" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -movflags +faststart ../hadi-ai-reel-30s-9x16-no-music.mp4

if [ -n "$SONG" ]; then
  ffmpeg -hide_banner -loglevel error -y -framerate 30 -i "$OUT/frames/f%04d.png" -ss "$SONG_START" -t 30 -i "$SONG" \
    -map 0:v -map 1:a -af "afade=t=out:st=29.0:d=1.0,loudnorm=I=-14:TP=-1.5:LRA=11" \
    -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -profile:v high -c:a aac -b:a 192k -ar 48000 \
    -movflags +faststart -shortest ../hadi-ai-reel-30s-9x16.mp4
fi
ffmpeg -hide_banner -loglevel error -y -i "$OUT/frames/f0130.png" -q:v 2 ../hadi-ai-reel-cover.jpg
echo done
