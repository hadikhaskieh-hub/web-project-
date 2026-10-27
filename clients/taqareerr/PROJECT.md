# تقارير · Taqareer: student news page

## Brief
- **Client:** تقارير (Taqareer, logo spelling "Taqareerr"), a news page run by a student journalist.
- **Audience:** Arabic-speaking students and young followers, mostly on Instagram.
- **Deliverable so far:** a 30-second vertical (9:16) intro video. All on-screen text is in Arabic.
- **The video's job:** make people trust the page and follow it. The message is "we verify before we publish."
- **Constraint:** no AI footage, because the Higgsfield account had about 7 credits (a 30s AI version needs about 45+). The video is all motion graphics, built from the logo.

## Design decisions
- **Colors (all from the logo):** ink `#111111`, breaking red `#D40F19`, paper `#F6F6F4`, newsprint `#E7E6E1`, graphite `#5C5C5C`.
- **Type:**
  - Alexandria 800/900 for headlines (geometric Kufi, close to the logo lettering)
  - IBM Plex Sans Arabic for body text
  - IBM Plex Mono for timecodes and timestamps
- **Signature:** the logo's three red burst strokes mark each key beat (the opening, the "موثّق" stamp, the logo reveal). Scene changes use thick stripe wipes at the logo's −14° angle, sweeping right to left like Arabic text.
- **Broadcast frame:** a running HUD (logo plus a red recording dot and timecode) and a news ticker sit over scenes 1–4.
- **Instagram safe zones:** key text sits roughly between y = 250 and 1500 so the Reels interface doesn't cover it.

## Storyboard (30 fps, 1080×1920)
| Time | Scene | Copy |
|---|---|---|
| 0–1.5 | Cold open: burst and headline stripes | — |
| 1.5–7 | The flood: rumor message cards pile up | كلّ يوم يصلك / سيلٌ من الأخبار → لكن… أيّها صحيح؟ |
| 7–13.5 | Verification: checklist, then the red stamp | نتحقّق قبل أن ننشر · نعود إلى المصدر الأصلي · نقارن أكثر من رواية · نقول ما نعرفه… وما لا نعرفه · موثّق |
| 13.5–19.5 | From the field: mic, camera and laptop icons | من الميدان… إليك · نسأل / نوثّق / نراجع · بعيونٍ طلابية، وبمعايير مهنية |
| 19.5–24.5 | The feed: category cards marked موثّق | قصص الطلاب بأصواتهم |
| 24.5–30 | Logo lock-up and follow call | الخبر كما هو · تابعوا تقارير |

Audio: a synthesized 120 bpm D-minor news bed, normalized to −14 LUFS (`source/music.py`), with hits synced to the picture.

## Files
- `taqareer-intro-30s-9x16.mp4`: the final video
- `taqareer-intro-cover.jpg`: Reel cover (logo frame)
- `assets/`: the original logo, separated logo layers (`paper`, `burst`, `wordmark-ar`, `wordmark-en`, `logo-lockup`) and the fonts
- `source/intro.html`: the whole animation as a seekable timeline (`seek(t)`). Open `intro.html?t=12` to see any moment.
- `source/render.js`: Playwright frame renderer. `node render.js stills 4.5 12` writes review stills.
- `source/build.sh`: rebuilds everything into the MP4

## Open to-dos
- [ ] Get the client's Instagram handle and add it to the end card.
- [ ] Optional: a 16:9 version for YouTube/Facebook (the layout needs reworking, not just a crop).
- [ ] Optional: replace scenes 1/3 with real or AI footage of the journalist (top up Higgsfield: about 7.5 credits per 5s Kling clip).
- [ ] Optional: swap the synthesized bed for licensed music if the client has a track.
