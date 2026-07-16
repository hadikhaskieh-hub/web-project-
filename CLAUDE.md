# Project: Websites for Local Businesses

This repository is used to design and build websites that are sold to local
businesses. Each project is a custom site for a specific client (restaurants,
salons, trades, clinics, shops, etc.).

## Always use the frontend-design skill

Whenever building a new website or reshaping an existing UI in this repo,
**apply the `frontend-design` skill**. Every site here is a paid deliverable
for a real client, so the design must feel custom and intentional — never a
templated default.

In practice, for every website build:

1. **Pin the brief.** Name the business, its audience, and the single job of
   the page (e.g. get reservations, book appointments, drive calls/visits).
   If the client hasn't specified, pick a concrete direction and state it.
2. **Brainstorm a design plan first** (do most of this in your thinking):
   - **Color** — 4–6 named hex values, specific to this business.
   - **Type** — a characterful display face + a complementary body face
     (and a utility face for captions/data if needed). Avoid the same
     pairings used on every other site.
   - **Layout** — a layout concept with a clear hero that opens on the most
     characteristic thing about this business.
   - **Signature** — the one memorable element this site is remembered by.
3. **Critique the plan** against generic defaults before coding. Avoid the
   common AI looks (cream + serif + terracotta; near-black + acid accent;
   broadsheet hairline columns) unless the brief explicitly asks for one.
4. **Build to a quality floor:** responsive down to mobile, visible keyboard
   focus, reduced motion respected, real (not lorem) copy written from the
   customer's point of view.

The full guidance lives in the `frontend-design` skill — follow it for the
aesthetic direction, typography, motion, and writing on every site.

## Also use the ui-ux-pro-max skill

This repo has the `ui-ux-pro-max` skill installed at
`.claude/skills/ui-ux-pro-max/`. Use it alongside `frontend-design` when
designing any site — run its design-system search for palette, typography,
style, and layout recommendations, then apply taste on top. Both skills load
automatically in every session opened on this repository.

## Resuming a client project (READ THIS FIRST)

Every client folder under `clients/<name>/` contains a **`PROJECT.md`** — the
single source of truth for that client: the brief, design decisions, what's
built, and the open to-do list. **Before continuing any client's site, read
that client's `PROJECT.md`** so you have the full context a fresh session would
otherwise be missing. Keep it updated as work progresses.

## Working conventions

- Each client site can live in its own directory (e.g. `clients/<name>/`) so
  multiple projects can coexist in this repo.
- Keep copy specific to the real business — local details, services, and tone
  beat generic filler.
- Each client folder keeps a `PROJECT.md` handoff doc (see above).
