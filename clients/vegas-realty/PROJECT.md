# Vegas Realty — Project Handoff / Status

**This file is the source of truth for the Vegas Realty site. Read it before continuing.**
The site is a single static file: `clients/vegas-realty/index.html` (no build step —
deliberately, so it deploys anywhere by just uploading the file).

---

## The client / brief
- **Business:** Vegas Realty — a real estate agency in Las Vegas, NV.
- **Star agent:** Juan Fabian Basurto (Google reviews rave about him by name).
- **Found via:** Google Maps. Rating 4.0 (3 reviews). No existing website.
- **Address:** 1180 N Town Center Dr #100, Las Vegas, NV 89144 (Summerlin).
- **Phone:** (702) 888-0888 · **Hours:** opens 9 AM (Mon–Sat used on site).
- **Page's one job:** get **phone calls + contact inquiries** (single scrolling page,
  no listings database).
- **Who this is for (our side):** the site owner sells websites to local businesses.
  Vegas Realty is his **first client**. He is not a developer — keep explanations plain.

## Design direction (built)
- **Style:** "Desert Luxe" — warm Summerlin desert palette (deliberately NOT the
  generic teal the skill first suggested).
- **Colors:** sand `#F5EFE6`, espresso `#2B2622`, bronze `#C2703D`, canyon red `#8A3324`,
  gold `#C9A35C`.
- **Type:** Cinzel (display) + Josefin Sans (body) — via Google Fonts.
- **Signature / motion:** hero "silk" cursor-trail (ported from a 21st.dev canvas
  component, recolored warm, vanilla JS, self-drifts when idle/touch); interactive
  neighborhood explorer that reveals each area.

## What's on the page (sections)
Nav (floating, tap-to-call) → Hero ("Find the home you dreamed of") → About Juan →
Services (Buy / Sell / Relocate) → Testimonials (real Google reviews) → Neighborhood
explorer (Summerlin, Henderson, Centennial Hills, Downtown LV, The Lakes) → Contact
(form + call CTA) → Footer.

## Mobile & robustness notes (important — learned the hard way)
- Content must be **visible without JS**. Reveal animations are gated behind a `.js`
  class added by a tiny head script; if JS doesn't run, everything still shows.
- Neighborhood rotation + hero glow have **CSS-only fallbacks** (`html:not(.js)`), so
  they animate even in no-JS local file viewers (e.g. Android "Files", WhatsApp).
- The client kept opening the file **inside WhatsApp**, which doesn't run JS — that was
  the cause of "nothing works on mobile," not a bug. Real test = a real browser or a
  hosted link.
- Mobile has a real toggle menu + a sticky "Call Juan" bar.

## Checklist grade ($10K checklist) — current honest status
- Point of view ✅ · Typography ✅ · Color ✅ · Hierarchy ✅
- Motion ✅ (silk hero + neighborhood rotation + button micro-interactions)
- Mobile ✅ (designed, not just shrunk)
- **Imagery ⚠️ — the main remaining gap.** Neighborhood scenes are art-directed CSS,
  not real photos. Juan's portrait is a styled placeholder.
- Invisible/"works" ⚠️ — form not live yet (no key); NV license # is a placeholder.

## OPEN TO-DO (what's left)
1. **Imagery:**
   - Generate the 5 neighborhood photos (start with Summerlin) and swap into the
     `.area-scene` blocks. Higgsfield image generation is available in-session.
   - Drop in **Juan's real headshot** (client to provide) into the `.portrait` block —
     do NOT generate a fake face for a real person.
   - Add the **logo** (client to provide; can't be pulled from Google Maps).
2. **Make the form actually work:**
   - Form posts via Web3Forms. Replace `WEB3FORMS_ACCESS_KEY` in the script with the
     real key (client gets it free at web3forms.com using Juan's email).
   - **Juan's email is not available yet** — placeholder until client provides it.
   - Set the **auto-reply** message in the Web3Forms dashboard.
   - Honeypot spam guard + inline success message are already built in.
3. **NV real estate license #** — replace `[add license number]` in the footer.
4. **Booking (paid upsell):** client wants to offer real booking as a higher tier —
   add a Calendly / Cal.com embed. Not complex; keep for the premium package.
5. **Preview/deploy:** client does NOT want it publicly published before payment.
   Plan: use a private/unguessable link (Netlify Drop or tiiny.host) for client review,
   take a deposit, then deploy final to **his domain on Hostinger**. Don't hand over
   final files/domain until paid.

## Workflow notes
- Deliverables are sent to the user with the SendUserFile tool (he downloads and opens
  from Files / a browser — not WhatsApp).
- Keep commits on the designated branch; the first PR (#1) is already merged to `main`.
