#!/usr/bin/env bash
# Renders the November sale reel: Remotion video (muted) + song section via ffmpeg.
# Needs assets/song.mp3 (the client's track). Output: out/dose-of-lashes-november-sale.mp4
set -euo pipefail
cd "$(dirname "$0")"
SONG_OFFSET=1.956   # same entry point into the song as the reference video
npx remotion render src/index.ts NovemberSale out/video-only.mp4 --muted --codec=h264 --crf=16
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/video-only.mp4)
FADE_START=$(python3 -c "print($D-1.2)")
ffmpeg -v error -y -i out/video-only.mp4 -ss "$SONG_OFFSET" -t "$D" -i assets/song.mp3 \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 44100 \
  -af "afade=t=in:st=0:d=0.05,afade=t=out:st=${FADE_START}:d=1.2" \
  -shortest -movflags +faststart out/dose-of-lashes-november-sale.mp4
echo "done: out/dose-of-lashes-november-sale.mp4"
