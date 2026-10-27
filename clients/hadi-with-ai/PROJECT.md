# hadi.ai: personal brand reel

## Brief
- **Client:** Hadi, AI consultant. The brand name is always written **hadi.ai**.
- **Deliverable:** a 30-second vertical (9:16) English reel about AI taking over jobs people spend years at university learning.
- **The reel's job:** hook with "You spent 4 years, AI learned it in 4 seconds", kill three jobs on the song's beat, strike out a list of degree-level jobs, then deliver the message "Adapt fast. Or get replaced." End on the hadi.ai card.
- **Do not mention how the video was made.** No "made with AI" or "this video" lines, and no mention of Claude.

## Current version (v3, keynote style): `source/reel.html`
- **Colors:** black, `#F5F5F7` white and `#86868B` grey. Red `#FF3B30` appears only at a kill. The only bright color is the AI glow (blue `#0894FF` → purple `#C959DD` → pink `#FF2E54` → orange `#FF9004`, Apple-Intelligence style). It shows on the app cards while the AI "works", on "4 seconds." and as the halo behind the logo.
- **Type:** Inter Tight 700/800 for headlines, Inter for body text, JetBrains Mono for code and figures.
- **Music:** "Doors Light Funk (Slowed)", supplied by Hadi as a WhatsApp video. It runs at exactly 96 BPM (0.625s per beat). The drop hits at song 0:25.0 and ends at 0:44.75. The reel uses the song from **0:17.5**.
- **Sync:**

| Reel time | Song time | What happens |
|---|---|---|
| 0–4.4 | 17.5–21.9 | Hook (song build), entrances on the beat |
| 7.5 | 25.0 (the drop) | **Coding** killed |
| 12.5 | 30.0 | **Design** killed |
| 17.5 | 35.0 | **Accounting** killed |
| 20.0–23.1 | 37.5–40.6 | Translation, Copywriting, Data analysis, Legal research, Market research, Customer support struck out, one per beat |
| 24.4 | 41.9 | "Adapt fast. Or get replaced." |
| 27.25 | 44.75 (drop ends) | hadi.ai end card |

- All timings are in the `TL` object at the top of the script, so re-syncing to a different song or start point is a one-place change.

## Files
- `hadi-ai-reel-30s-9x16-no-music.mp4`: the reel without audio (tracked). Post this and add the song in Instagram's music picker from **0:17**.
- `hadi-ai-reel-30s-9x16.mp4`: the reel with the song mixed in. It is git-ignored so the copyrighted song isn't stored in the repo.
- `hadi-ai-reel-cover.jpg`: cover image
- `source/build.sh <song file>`: rebuilds everything
- `source/reel-v1.html`, `source/beat.py`, `ai-killed-3-jobs-30s-9x16.mp4`: the earlier colorful version with the synthesized beat (superseded)

## Open to-dos
- [ ] Add the Instagram/TikTok handle to the end card if wanted.
- [ ] Optional voiceover. It needs Higgsfield's CDN (`d1xarpci4ikg0w.cloudfront.net`, `cdn.higgsfield.ai`) allowed in the environment's network settings, or use a free local voice.
