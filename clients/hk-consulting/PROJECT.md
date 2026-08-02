# HK Consulting — Project Handoff / Status

**Read this before continuing.** This is the site owner's OWN agency site (not a client job).
Static, no build step: `index.html` + `styles.css` + `script.js` + `assets/`.

## The business
- **HK Consulting** — AI consulting / automation agency.
- **Main services RIGHT NOW (owner's explicit focus):** professional **websites** and
  **AI receptionists**. Everything else (Sales/Ops/Data/Finance/HR/Marketing AI) is
  secondary — kept as a supporting grid under "the rest of the business, automated."
- **Positioning for AI receptionists:** hiring AI staff = more output, less cost.
- **Conversion goal:** book a free AI audit call. Every CTA points at `BOOKING_URL`.

## Owner's edits applied (from the previous version)
- **REMOVED** "Trusted by Microsoft Partners" + partner logos — no real partners yet.
- **REMOVED** the testimonial/"Their Feedback?" section — no real reviews yet.
  Do NOT re-add invented reviews. When real ones exist, add them then.
- **ADDED** two flagship service blocks (AI Receptionist 01, Websites 02) with detail.
- Replaced the generic Inter + violet/cyan look (the default AI-startup skin, and Inter
  is called out on the owner's own $10K checklist as overused).

## Design direction — "Signal"
- **Palette:** ink `#07090C`, surfaces `#0D1116`/`#131922`, text `#F3F6F9`,
  muted `#8E9BA9`; accent **warm amber** `#FFB067` → `#FF8A4C` (a call answered, a light
  left on). **Mint `#6EE7C7` is reserved for live/system states only** — never decorative.
  Deliberately NOT violet→cyan.
- **Type:** Sora (display) + Inter Tight (body) + JetBrains Mono (labels, timestamps,
  transcript, data). The mono is the "system" voice.
- **Signature:** the hero **live-call card** — a real transcript of the AI receptionist
  answering a flooding-kitchen call at 2:14 AM and booking it for 9:00 AM. It shows
  what the product *is* in five seconds. Bubbles fade in on scroll.
- **Value tool:** the **missed-call calculator** — 3 sliders → "$X walking away every
  year." Honest caption says it's an estimate, not a quote.

## Gotcha already hit (don't reintroduce)
`.js .bubble.typing` (specificity 0,3,0) beat `.bubble.shown` (0,2,0) and the whole
signature transcript stayed invisible. Fixed with `.js .bubble.typing.shown`.
Watch CSS specificity whenever a `.js`-gated hidden state needs a visible override.

## Robustness
- All content readable with JS off (`.js` class gates reveals; FAQ panels open by
  default without JS via `html:not(.js) .accordion-panel { height:auto }`).
- Verified in a real browser: **0px horizontal overflow at 375px and 1280px**;
  counters, calculator, accordion (one-open-at-a-time), mobile menu all working.
- `prefers-reduced-motion` disables mesh drift, reveals, counters, transcript timing.

## How to reskin / rebrand
- **Brand name:** find-and-replace `HK Consulting` (also `hkconsulting.example.com`
  in the canonical/OG tags and the JSON-LD).
- **Booking link:** `BOOKING_URL` at the top of `script.js` — currently `/apply`.
  Swap for the Calendly/GHL URL; every CTA picks it up automatically.
- **Colors/spacing/radii:** all in `:root` at the top of `styles.css`.

## OPEN TO-DO
1. Real booking URL (Calendly / GHL) into `BOOKING_URL`.
2. Real domain in canonical + OG + JSON-LD; make a real `assets/og-image.png`
   (currently referenced as an SVG placeholder).
3. Real social links in the footer (currently `#`).
4. Add testimonials + partner logos **only when genuine ones exist**.
5. The case-study numbers (67/50/10+/35) came from the owner's earlier draft — confirm
   they're defensible before launch, since they're now the site's main proof.
6. Deploy: same flow as other projects — private preview link, then real host.
