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

All three are the same front angle, shot in a shop (mirror, vase, plants). **There is no photo of the back, the sides, the bottom, or the inside.** The logo is a metallic print, not embossed.

## Status
Planning. Nothing generated yet. Waiting for the client to approve the shot list, choose a budget, and send the missing angles.

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
- [ ] Client: approve the shot list.
- [ ] Client: photos of the back, one side, and the inside with the flap open (the black bag at least). Remove tags and the film on the lock first.
- [ ] Client: choose a budget (credits) and whether per-colour versions are wanted.
- [ ] Confirm whether "genuine leather" can be claimed. Until then, say nothing about the material.
- [ ] Generate one test still, confirm the download host, ask the client to allow it.
