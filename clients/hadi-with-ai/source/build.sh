#!/usr/bin/env bash
# Rebuilds the hadi.ai reel with narration (no music).
#   ./build.sh <kokoro-dir>   (folder holding kokoro-v1.0.onnx + voices-v1.0.bin, from
#                              github.com/thewh1teagle/kokoro-onnx releases; pip install kokoro-onnx soundfile)
# voice.py writes timeline.js, which times every scene and kill in reel.html to the narration.
set -euo pipefail
cd "$(dirname "$0")"
KOKORO="${1:?pass the kokoro model folder}"
export OUT="${OUT:-$(pwd)/../build}"
mkdir -p "$OUT"

python3 voice.py "$KOKORO" "$OUT"
python3 sfx.py "$OUT/sfx.wav"
# deeper, calmer, more present: -1 semitone (formants kept), warmth, presence, gentle compression
ffmpeg -hide_banner -loglevel error -y -i "$OUT/voice_raw.wav" -af \
  "aresample=48000,rubberband=pitch=0.944:formant=preserved,highpass=f=65,equalizer=f=130:t=q:w=1:g=3,equalizer=f=3200:t=q:w=1.2:g=2,acompressor=threshold=-20dB:ratio=3:attack=5:release=90:makeup=2" \
  "$OUT/voice.wav"
ffmpeg -hide_banner -loglevel error -y -i "$OUT/voice.wav" -i "$OUT/sfx.wav" -filter_complex \
  "[1:a]volume=0.45[s];[0:a][s]amix=inputs=2:normalize=0:duration=longest,loudnorm=I=-14:TP=-1.5:LRA=9" \
  -ar 48000 -ac 2 "$OUT/mix.wav"

rm -rf "$OUT/frames" && node render.js frames
ffmpeg -hide_banner -loglevel error -y -framerate 30 -i "$OUT/frames/f%04d.png" -i "$OUT/mix.wav" -map 0:v -map 1:a \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -profile:v high -c:a aac -b:a 192k -ar 48000 \
  -movflags +faststart -shortest ../hadi-ai-reel-voiceover-9x16.mp4
ffmpeg -hide_banner -loglevel error -y -i "$OUT/frames/f0120.png" -q:v 2 ../hadi-ai-reel-cover.jpg
echo done
