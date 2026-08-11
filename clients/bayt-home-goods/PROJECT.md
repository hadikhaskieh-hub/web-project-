# Bayt — Project Handoff / Status

**Read this before continuing.** Running instructions live in `README.md`.
This file is the brief, the design decisions and the open list.

## The business

- **Bayt** — a home goods shop on Armenia Street, Mar Mikhael, Beirut.
  *Bayt* is Arabic for house, and every order code starts `BY`.
- **Sells:** ceramics and tableware, washed linen, lamps, baskets, kitchenware.
- **Audience:** people furnishing small Beirut apartments, plus housewarming
  and wedding gift buyers.
- **The single job of the site:** get an order placed. Not brand awareness,
  not a newsletter. Every page ends in a route to the basket.
- **Payment:** no processor. Cash on delivery, or a bank / mobile transfer
  where the customer submits the receipt reference and the owner confirms it
  before packing. This is normal practice in Beirut and it is the reason the
  checkout has no card fields at all.

## Design direction — "the shop after closing"

- **Palette (locked by the client, do not widen):**
  ground `#14120f`, surface `#1e1b17`, hairline `#2e2a24`, ink `#f2ede4`,
  muted `#a49b8c`, single accent `#6f8f7a` (desaturated eucalyptus).
  Warm neutrals only. One dark theme on every page, no light sections.
  All defined in the `@theme` block in `app/globals.css`. **No raw hex in
  components.**
  - Two additions, both deliberate and both documented in the CSS:
    `--color-warn` / `--color-warn-ink` for form errors only, because an error
    has to be distinguishable from a call to action, and the lamp colours
    (`--color-lamp*`) used by the hero room and nowhere else.
- **Type:** Outfit for display, IBM Plex Mono for prices, order codes and small
  uppercase labels. Display headings run `tracking-tighter leading-none`.
  No serif anywhere. Both faces are self hosted in `app/fonts/`.
- **Signature: the hero room.** The shop after closing, drawn in SVG. A shelf
  of plates, folded linen, a jug, a table lamp and a basket under a hanging
  rattan pendant. Scroll progress writes one custom property, `--lit`, and CSS
  does everything else: the wall warms, the goods take colour, the bulb comes
  up, and the shadows on the shelf shorten. `requestAnimationFrame` throttled,
  transforms and gradients only.
  - Under `prefers-reduced-motion` no listener is attached and the stylesheet
    pins `--lit: 1`, so the room arrives fully lit.
  - `--lit` starts at `0.35`, not `0`, so with JavaScript off the shelf is
    still visible.
  - Nothing on any page sits at `opacity: 0` waiting for an observer. A full
    page screenshot shows every section.
- **Layout rule:** each layout family appears at most once per page. On the
  home page that is exactly one of each: hero (asymmetric split), featured
  products (card grid), categories (horizontal rail), ordering steps (numbered
  row), delivery and payment (full bleed plate). The step numbers are honest,
  it really is a sequence.
- **Buttons are four separate identities, not one component:**
  - `.btn-slab` — filled accent, arrow slides on hover. "Shop all", "Checkout".
  - `.btn-wipe` — outlined, accent fill wipes upward. "Add to basket".
  - `.btn-bar` — full width solid bar. "Place order", and every admin save.
  - `.link-quiet` — bare, underline grows in. Quiet actions.
  - `.btn-step` — 44px square, quantity steppers only.
- **Product artwork.** Every seeded product is **drawn**, not photographed, in
  `components/product-artwork.tsx`: an SVG in the same palette and the same
  light as the shelf in the hero, so the catalogue reads as one room. The
  artwork shares the `.goods-palette` class with the hero and simply pins
  `--lit` to a fixed lit value instead of driving it from scroll.
  - What a product shows, in order: the owner's uploaded photo, then the
    drawn artwork for that piece, then a designed tile with the product
    initial and a "photo soon" label. Never a broken image, never a grey box,
    never a stock photo.
  - Artwork is matched by slug, then by shelf, so a product the owner adds
    later still gets something drawn rather than an empty tile.
  - **This is deliberate, not a stand in for missing photography.** It works
    as a pitch and as a launch state. Real photos replace it per product the
    moment one is uploaded, with no code change.
- **Copy rules:** headlines eight words or fewer. No em dashes in anything
  visible. No "elevate", "seamless", "unleash". No invented statistics and no
  fake testimonials.

## What is built

Storefront: `/`, `/shop` (with `?category=` and a chip row), `/product/[slug]`,
`/cart`, `/checkout`, `/order/[code]`, `/how-it-works`, plus a composed 404.

Admin at `/admin`: first run owner setup, sign in, and the Orders, Products,
Settings and Team tabs.

Interaction states are all implemented, not just the happy path: skeletons
shaped like the real rows while the basket hydrates, composed empty states for
an empty basket and an empty shelf, inline field errors under labelled inputs,
a disabled and labelled submit while an order is in flight, and `:active`
feedback on every control.

Verified in a real browser: full order placed end to end, admin created, photo
uploaded and deleted, 0px horizontal overflow at 375px and 1280px, no console
errors, visible focus rings, reduced motion honoured.

## Gotchas already hit (do not reintroduce)

1. **`lib/db.ts` module order.** `export const db = ...` opens the connection,
   which runs the seed, which reads `DEFAULT_SETTINGS` and `SEED_PRODUCTS`. The
   export therefore has to sit **below** those constants or the build dies with
   `Cannot access 'o' before initialization`. It is not a circular import.
2. **Component CSS must be inside `@layer components`.** Unlayered rules beat
   Tailwind's layered utilities, so `.link-quiet { display: inline-block }` was
   silently overriding `inline-flex` and pushing every icon onto its own line.
3. **Runtime values cannot be imported from `lib/db.ts` into client code**
   (it pulls in `server-only` and the native driver). `ORDER_STATUSES` and
   `STATUS_LABELS` live in `lib/order-status.ts` for exactly this reason.
   Types are fine, `import type` is erased.
4. **A grid using `gap-px` over a `bg-hairline` parent leaves a large coloured
   block** wherever the last row is not full. Use the `.hairline-grid` class
   instead, which draws the rules with outlines and so takes no space.
5. **`next/font/google` needs the network at build time** and the URLs it
   requests were unreachable from the build environment. The fonts are self
   hosted through `next/font/local` now. Do not switch back.

## OPEN TO-DO

1. **Replace the placeholder contact details before launch.** Settings ships
   with `+961 1 000 000`, `+961 71 000 000` and `hello@bayt.example`. All three
   are deliberately fake. Change them in the Settings tab.
2. **Real product photos, when the owner has them.** All eight seeded products
   currently render their drawn artwork, which is a presentable launch state.
   Uploading a photo in the Products tab replaces the drawing for that piece,
   one at a time, so the shop never looks half finished mid swap. Portrait
   shots on a plain warm background suit the grid.
3. **Confirm the shop details in the footer** ("Armenia Street", "Tuesday to
   Saturday, eleven to seven") and the seven day returns window on
   `/how-it-works` against what the owner actually offers.
4. **Confirm the delivery numbers.** Seeded at $4.00 inside Beirut, free over
   $60.00. Currency is USD.
5. **Deploy.** Needs a host with a persistent disk, since the database is a
   file on disk and photos are written to `public/uploads`. A container with a
   mounted volume, or a small VPS. Serverless will lose both.
6. **Set a real `SESSION_SECRET`** in the production environment. The app
   refuses to start in production without one.
7. **Backups.** `db/shop.db` and `public/uploads/` need to be backed up
   together, they reference each other.
8. Nice to have later: order search in the admin panel, a printable delivery
   slip, and letting a staff member change their own password.
