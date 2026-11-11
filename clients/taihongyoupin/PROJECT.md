# TAIHONGYOUPIN Fashion: handbag product ad

## Brief
- **Product:** structured top-handle satchel, TAIHONGYOUPIN Fashion. Pebbled-grain body, flap embossed with a diamond lattice, silver twist-lock on a rectangular tab with four silver corner caps, silver handle rings, detachable long shoulder strap, small metallic "TAIHONGYOUPIN FASHION" logo centred on the lower front.
- **Colours:** black, taupe, cognac brown.
- **Deliverable:** a 15–25s luxury product commercial for Instagram Reels and TikTok (9:16), plus a 1:1 version for the feed. Per-colour versions if possible.
- **The ad's job:** sell the bag. End text: "متوفرة بـ 3 ألوان – اطلبيها هلق".
- **Rules from the client:**
  - Talk to the client in Arabic; write generation prompts in English.
  - Use the photos as image-to-video references. The bag's shape, colours, lock and logo must not change.
  - Ask before inventing any angle there is no photo of (back, inside).
  - Never write "جلد طبيعي" / "genuine leather" unless the client confirms it.
  - Show a shot list before generating anything.

## Reference photos (`reference/`)
| File | Colour | Notes |
|---|---|---|
| `black-front.jpg` | Black | Front three-quarter view. Strap is detached and lying beside the bag. Logo is silver and fully legible, so this is the logo reference. |
| `taupe-front.jpg` | Taupe | Front view. The lock still has protective plastic film on it. Hang tag visible. |
| `cognac-front.jpg` | Cognac | Front view. Price tags visible. The logo is partly faded in the photo. |
| `black-back.jpg` | Black | Back, on a bed. Shows the zip pocket. |
| `black-bottom.jpg` | Black | Base with four metal feet; a hand holds the bag. A price tag reads $35.00. |

The three front photos were shot in a shop (mirror, vase, plants). **There is no photo of the sides or the inside.** The logo is a metallic print, not embossed.

## Status
**Version 1 delivered**: `taihongyoupin-ad-9x16.mp4` (Reels/TikTok) and `taihongyoupin-ad-1x1.mp4` (feed), 21.5s each, plus `taihongyoupin-ad-cover.jpg`.

The client decided not to use Higgsfield (7.73 credits, free plan, and its file hosts are blocked from this environment), so v1 uses **no AI generation**. Every bag pixel is the client's real photo:
1. Backgrounds removed locally with rembg (BiRefNet).
2. `source/prep.py` cleans the cut-outs (vase, strap clip and stray objects removed), neutralises the warm shop light, deepens the black bag, bakes a soft contact shadow and makes the detail crops.
3. `source/ad.html` is the edit: a seekable timeline on a cream studio set, with slow push-ins, a light sweep that follows each bag's shape, and Arabic text. `?ar=1x1` switches to the square layout.
4. `source/render.js` renders frames with Playwright; `source/music.py` synthesizes the calm music bed; `source/build.sh` does all of it.

### What v1 shows (21.5s)
| Time | Shot |
|---|---|
| 0–2.4 | Hook: close-up of the silver twist-lock, light sweep, "أناقة بكل تفصيل" |
| 2.4–8.4 | Black bag on the studio set; it turns to show the back zip pocket, then turns back |
| 8.4–13.5 | Three detail tiles: diamond embossing, handle and rings, metal feet on the base |
| 13.5–17.5 | Taupe ("بيج"), then cognac ("بني") |
| 17.5–21.5 | All three colours, "متوفرة بـ 3 ألوان", button "اطلبيها هلق" |

### Honest limits of v1
- **No true 360.** The turn is a flip between the real front photo and the real back photo. A continuous orbit needs AI video or a real turntable video.
- **The lock does not turn**, and there is no inside shot (no photo of the inside).
- Detail tiles are 2.4–3× enlargements of WhatsApp-compressed photos, so they are a little soft.
- The taupe bag's lock still has its protective film in the photo; it is faintly visible.
- Back and base photos exist for the black bag only.

## Original AI plan (not used in v1)
The shot list and prompts below were the plan for an AI-generated version. Kept in case the client tops up Higgsfield later.

## Blockers
- **Credits:** Higgsfield balance is 7.73 (free plan). A studio still costs 0.25; a 5s Kling 3.0 clip costs 7.5 (standard) or 8.75 (pro).
- **Network:** this environment could not download from Higgsfield's file hosts (`d1xarpci4ikg0w.cloudfront.net`, `cdn.higgsfield.ai`) when last tried. The result host for generations is not confirmed yet; test with one still, then ask the client to allow that host.
- **Missing angles:** back, side, inside. A full 360 and the open-flap shot need them.

## Shot list (about 22s)
| # | Time | Shot | Colour | Source | Ready? |
|---|---|---|---|---|---|
| 1 | 0–2s | Hook: macro on the twist-lock as the toggle turns 90° | Black | Macro studio still → video | Yes |
| 2 | 2–8s | Hero orbit around the bag | Black | Studio still → video | Arc of about 120° now; full 360 needs a back photo |
| 3 | 8–10s | Macro slide across the diamond embossing, raking side light | Black | Macro still → video | Yes |
| 4 | 10–12s | Tilt from the flap-edge stitching up to the handle and rings | Black | Still → video | Yes |
| 5 | 12–14s | Flap opens, lining and pockets | Black | Needs an inside photo | No |
| 6 | 14–16s | Slow push-in | Taupe | Studio still → video | Yes |
| 7 | 16–18s | Slow push-in | Cognac | Studio still → video | Yes |
| 8 | 18–22s | The three colours side by side, slow push-in, end text added in the edit | All | Composite still → video | Yes |

If there is no inside photo, shot 5 is replaced by a second detail shot (handle hardware), not an invented interior.

## Method
1. **Clean studio stills first** (image edit from each photo, 0.25 credit each): same bag, tags and shop removed, cream seamless set, softbox key and rim light. Check each still against the photo (shape, lock, corner caps, logo spelling) before animating.
2. **Animate each still** (image-to-video, start frame = the approved still). Camera moves only; the bag never moves or changes.
3. **Check every clip frame by frame** for a warped shape, a changed lock, or garbled logo text. Reject and redo, or cut around it.
4. **Edit with ffmpeg:** soft cross-dissolves, the Arabic end text rendered in the edit (not by the AI, so it stays crisp), a calm luxury music bed, 9:16 master and a centre-cropped 1:1.

## Prompts (English)

**Studio still, per colour** (reference = that colour's photo):
> Use the reference photo as the exact product. Recreate the same handbag, unchanged, as a luxury studio product photograph: a {black | taupe | cognac brown} structured top-handle satchel with a pebbled-grain body, a flap embossed with a diamond lattice, a silver twist-lock on a rectangular tab with four silver corner caps, silver handle rings, and the small metallic "TAIHONGYOUPIN FASHION" logo centred on the lower front. Keep the shape, proportions, colour, hardware, stitching and logo exactly as in the reference. Remove the price tags, hang tag, protective film, shop interior, mirror, vase and plants. The bag stands upright and centred on a matte warm-cream seamless surface with a soft cream backdrop. Large softbox key light from the upper left, a subtle rim light on the right edge and the handle, a soft contact shadow. Front three-quarter view at eye level. No props, no text overlay, no people. Vertical 9:16, the bag sits inside the central square of the frame.

**Shot 1, lock hook:**
> Extreme macro, locked-off camera. The oval silver turn-lock toggle rotates slowly 90 degrees with a crisp mechanical motion; a soft highlight sweeps across the polished metal and the four silver corner caps. The black pebbled surface and diamond embossing stay perfectly still and unchanged. Shallow depth of field, studio softbox lighting. The flap stays closed. No hands, no text.

**Shot 2, hero orbit:**
> Smooth, slow camera orbit at eye level around the handbag, from the front-left three-quarter view, across the front, to the front-right three-quarter view. The bag stays perfectly still, upright and centred; its shape, colour, silver hardware and logo do not change. Seamless warm-cream studio, softbox key light, a rim light tracing the edges and the handle. Stabilised gimbal motion, constant speed, no shake, no zoom, no extra objects.

(Full 360 version, only with a back photo: same prompt, "a full 360-degree orbit", with the back photo as an extra reference.)

**Shot 3, texture macro:**
> Macro, slow slide from left to right across the flap. Raking side light reveals the depth of the diamond embossing and the pebbled grain; highlights travel gently across the ridges. Shallow depth of field. The surface does not move or change.

**Shot 4, stitching and handle:**
> Close-up, slow tilt up from the stitched edge of the flap to the top handle and its silver rings. Soft studio light, a rim light on the handle. Even, straight stitching stays sharp. The bag does not move.

**Shots 6 and 7, colour push-ins:**
> Slow, steady push-in on the {taupe | cognac brown} handbag standing centred on a warm-cream seamless set. Softbox key light, rim light on the edges. The bag stays perfectly still and unchanged. No shake.

**Shot 8, three colours** (still from all three references, then animate):
> Three identical handbags standing side by side on a warm-cream seamless surface: black on the left, taupe in the centre, cognac brown on the right, evenly spaced, all facing forward, slightly angled toward the centre. Each matches its reference exactly. Soft studio light, soft shadows, clean empty space in the upper third for text. — Motion: slow, steady push-in; nothing else moves.

**Negative prompt, all video shots:**
> warped shape, melting, changed logo, misspelled text, extra straps, extra hardware, changed lock, hands, people, tags, labels, clutter, camera shake, fast motion, colour shift, flicker

## Open to-dos
- [ ] Better source photos would lift quality most: original files (not WhatsApp), daylight, tags and lock film removed, plus the inside with the flap open.
- [ ] Optional: a short phone video walking around the bag on a table gives a real 360 to cut in.
- [ ] Add price, shop name/handle and delivery info to the end card if the client wants them.
- [ ] Confirm whether "genuine leather" can be claimed. Until then, say nothing about the material.
- [ ] Per-colour versions (needs back/detail photos of taupe and cognac to be more than a recolour of the edit).
