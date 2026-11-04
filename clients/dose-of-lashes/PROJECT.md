# Dose of Lashes — Project Handoff / Status

**Read this before continuing any Dose of Lashes work.**

## The client
- **Business:** Dose of Lashes, a lash studio (Lebanon).
- **Phone / WhatsApp:** 70/946168 on the price list, shown as **70 946 168** in the video.
- **Logo:** black "DL" serif monogram + closed-eye lash line + "Dose of lashes" on a flat
  `#F2F2F2` background. Always use it as given: never recolour or distort it. When it
  needs to sit on a colour, put it on its own `#F2F2F2` tile.

## Price list (source of truth, from the client's image)
Full set / Refill (2 weeks) / Refill (3 weeks):

| Full set | Price | Refill 2w | Refill 3w |
|---|---|---|---|
| Classic lashes | $40 | $20 | $25 |
| 2d lashes | $40 | $20 | $30 |
| Silk lashes | $50 | $25 | $30 |
| 3d lashes | $50 | $25 | $30 |
| Hybrid lashes | $55 | $25 | $30 |
| Volume lashes | $60 | $25 | $30 |

Extras: Reshaping $5, Lash removal $10, Lamination $15, Lash Lifting $20.
(The list spells it "Lifiting"; spell it **Lifting** in anything new.)

## Deliverable 1: November sale reel (DONE)
- **Final file:** `exports/dose-of-lashes-november-sale.mp4` (1080x1920, 30 fps, H.264
  High, AAC 192k, 33.4 s). Overview frames: `exports/dose-of-lashes-overview.jpg`.
- **Offer:** ALL full sets $30, **Nov 9 – 11 only** (3 days), limited seats.
- **Client decisions:** show all **6** sets from the price list (not a combined "2D Silk"),
  in title case (Classic Lashes, 2D Lashes, Silk Lashes, 3D Lashes, Hybrid Lashes,
  Volume Lashes). Prices are written `$40` style. CTA is WhatsApp.
- **Reference it copies:** an After Effects "iMessage → Uber app" promo (screen-recorded
  by phone). It uses the **same song**, starting at 1.956 s, 129 BPM. Our cut follows
  the same flow:
  chat bubbles over the build-up → dip to white on the drop, the bubble morphs into an
  app tile ($30) → search bar → UI cards every 2 beats (one per set: old price struck in
  red, $30 tag pops on the half-beat) → slow calendar zoom during the song's silent
  break → dates 9 / 10 / 11 get iOS-red circles one per beat as the music returns →
  "Nov 9 – 11 Only" → iOS notification over blurred calendar → white flash to the logo
  + 72:00:00 countdown (ticks every 2 beats) + "Limited seats available" → hard cut to
  black: "DM us to book your seat" + WhatsApp pill.
- **Palette:** black `#000`, ink `#141110`, white, logo grey `#F2F2F2`, iOS grey
  `#F2F2F7`, peach-gold `#F5B567` (from the price-list tags), iOS red `#FF3B30`.
- **Type:** Inter (UI, close to SF Pro in the reference) + Bodoni Moda (the $30s and
  "Nov 9 – 11 Only", echoing the logo's high-contrast serif).
- **Safe zones:** all text kept inside x 90–940, y 250–1480 (clear of IG/TikTok UI).

### How to edit / re-render
- Source: `promo-video/` (Remotion 4). Scenes are all in `src/NovemberSale.tsx`;
  beat times in `src/beats.json` (librosa, relative to the 1.956 s song offset);
  `B(n)` in `src/timing.ts` converts beat n to a frame.
- The song is **not committed**. Put the client's track at `promo-video/assets/song.mp3`.
- `npm install`, then `./render.sh`. In the cloud container, set
  `REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`.
- Live preview: `npm run studio`.
- Remotion is free for individuals and companies with up to 3 employees; larger teams
  need a Remotion company licence.

## OPEN TO-DO
1. If the client wants an Instagram handle on the CTA too, add it under the WhatsApp pill
   in `CTAScene`.
2. If the sale dates change, update `HIGHLIGHT` (calendar) and every "Nov 9 – 11" string.
3. No website yet. When one is built, follow the repo's frontend-design flow and reuse the
   palette/type above.
