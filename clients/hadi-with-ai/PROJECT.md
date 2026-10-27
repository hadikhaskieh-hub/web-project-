# Hadi With AI: personal brand reel

## Brief
- **Client:** Hadi, an AI consultant (personal brand: "Hadi with AI").
- **Deliverable:** a 30-second vertical (9:16) English reel, "AI just killed 3 jobs."
- **The reel's job:** stop the scroll with a provocative hook, show coding, design and editing being done by AI, then push the message "adapt fast or get replaced, learn the AI tools." It ends by revealing that the reel itself was made with AI, followed by Hadi's end card ("made by HADI · AI Consultant", with a "HADI WITH AI" band at the bottom).
- **Music:** Hadi asked for something exciting, Brazilian funk or similar. Since no AI credits were spent, it's a synthesized Brazilian-phonk style beat.

## Design decisions
- **Colors:** signal cobalt `#1C2CF5` (main background), funk pink `#FF5BC8` (the "AI" accent), obituary red `#FF2A3D` (used only for the DEAD stamps), ink `#0B0B12`, white. This deliberately avoids the near-black plus acid-green "AI" look.
- **Type:** Unbounded 900 for headlines, Instrument Sans for body text, JetBrains Mono for code and UI labels.
- **Signature:** each job gets a heartbeat line under its fake app screen. It flatlines (shown as "♥ 0 BPM") and a red **DEAD** stamp slams down on the downbeat with a flash and a screen shake.
- **The edit is built on a 128 BPM grid (one beat = 0.46875s).** Every cut, stamp and word lands on a beat, and the whole picture pulses slightly on each kick during the drops.

## Storyboard
| Time | Scene |
|---|---|
| 0–3.75 | Hook: AI / JUST KILLED / 3 JOBS. · "Is yours next?" · 3-2-1 countdown → drop |
| 3.75–9.4 | 01 CODING: a code editor writes a login page from a prompt → DEAD · "Coding is dead." |
| 9.4–15 | 02 DESIGN: a poster assembles itself on a canvas → DEAD · "Designing is dead." |
| 15–20.6 | 03 EDITING: clips snap onto a timeline and the playhead races → DEAD · "Editing is dead. (Yes, this video too.)" |
| 20.6–24.4 | ADAPT FAST. / OR GET REPLACED. · "Learn the AI tools. Multiply your output." |
| 24.4–26.25 | This whole video? ✓ Script ✓ Visuals ✓ Editing ✓ Music → MADE WITH AI. |
| 26.25–30 | made by HADI · AI CONSULTANT · "I help people and businesses work faster with AI." · Follow for more → · HADI WITH AI band |

## Files
- `ai-killed-3-jobs-30s-9x16.mp4`: the final reel
- `ai-killed-3-jobs-cover.jpg`: cover image (hook frame)
- `source/reel.html`: the full animation as a seekable timeline (`?t=12` to see any moment)
- `source/beat.py`: the synthesized beat (kick + 808 pattern, cowbell melody, effects synced to the edit)
- `source/render.js`, `source/build.sh`: render the frames, encode, and rebuild everything

## Open to-dos
- [ ] Add Hadi's Instagram/TikTok handle to the end card.
- [ ] Optional: a real photo or video of Hadi on the end card.
- [ ] Optional: replace the synthesized beat with a licensed Brazilian funk track, keeping the cuts on 128 BPM.
