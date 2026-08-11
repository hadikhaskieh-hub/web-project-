# Bayt

A working shop for a home goods business in Mar Mikhael, Beirut. Ceramics,
linen, lamps, baskets and kitchenware, delivered across the city and paid for
in cash on delivery or by transfer.

It is a real shop rather than a mockup: a storefront, a SQLite database, a
checkout that prices orders on the server, and an admin panel the owner uses
to run the shop herself.

## Stack

| Piece      | Choice                                                        |
| ---------- | ------------------------------------------------------------- |
| Framework  | Next.js 15, App Router, React Server Components by default     |
| Language   | TypeScript                                                     |
| Styling    | Tailwind CSS v4, tokens in a `@theme` block in `app/globals.css` |
| Database   | SQLite through `better-sqlite3`, no ORM                        |
| Data layer | `lib/db.ts`, one typed function per query                      |
| Auth       | `node:crypto` only. scrypt hashes, an HttpOnly signed cookie   |
| Payments   | None online. Cash on delivery, or a transfer the owner confirms |
| Fonts      | Outfit and IBM Plex Mono, self hosted in `app/fonts/`          |

## Running it

```bash
npm install
cp .env.example .env.local     # then set SESSION_SECRET
npm run dev                    # http://localhost:3000
```

For production:

```bash
npm run build
npm run start
```

Other scripts:

```bash
npm run typecheck              # tsc --noEmit
npm run db:reset               # delete the database, next start reseeds it
```

### The session secret

`SESSION_SECRET` signs the admin session cookie. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

In development a built in fallback is used if the variable is missing, and
sessions reset on every restart. **In production the app refuses to start
without it**, on purpose: changing the secret signs every existing session
out, which is what you want if a laptop goes missing.

## Where the data lives

- **Database:** `db/shop.db`, created on first boot from `db/schema.sql`
  using `CREATE TABLE IF NOT EXISTS`, then seeded with 4 categories and 8
  products. Set `BAYT_DB_PATH` to move it. It is in `.gitignore`, so it never
  reaches the repository.
- **Product photos:** `public/uploads/`, served as static files. Uploads get a
  random 32 character filename. The name the customer's computer gave the file
  is thrown away. Also gitignored.
- **Product artwork:** products with no uploaded photo are drawn instead, in
  `components/product-artwork.tsx`. It is SVG in the site's own palette, so it
  costs nothing to serve and needs no files on disk. Uploading a photo
  replaces the drawing for that product.

Back both of these up together. The database rows point at the photo files.

### Resetting

```bash
npm run db:reset
```

This deletes `db/shop.db` and its journal files. The next start recreates the
schema and reseeds the categories and products. **Orders, staff accounts and
settings go with it.** Uploaded photos are left alone.

### Changing the seed data

The seed lives in `lib/db.ts`, in three places near the top:

- `DEFAULT_SETTINGS` — store name, currency, delivery fee, free delivery
  threshold, transfer number, contact details, payment toggles.
- `SEED_CATEGORIES` — the four shelves.
- `SEED_PRODUCTS` — the eight starting products.

Seeding only runs when a table is empty, so editing these has no effect on a
shop that already has data. Run `npm run db:reset` first, or make the change
through the admin panel instead, which is usually what you want on a live shop.

`DEFAULT_SETTINGS` also fills in gaps at read time, so adding a new setting
key there gives every existing shop a sensible default without a migration.

## The admin panel

`/admin`, hidden from search engines with `noindex`.

- **First run.** While the `staff` table is empty, `/admin` shows a form that
  creates the owner account. As soon as one account exists that path closes
  and returns 403, and the page shows a normal sign in.
- **Orders.** Newest first, with the phone number, address, note, line items,
  total, payment method and transfer reference. The status dropdown saves
  immediately.
- **Products.** List plus editor. Create, edit, delete, upload a photo.
- **Settings.** Shop name, contact details, transfer number, delivery fee,
  free delivery threshold, and a toggle for each payment method.
- **Team.** Add another staff account.

Every admin endpoint checks the session before it does anything and returns
401 otherwise. Passwords are eight characters or more.

## How ordering is kept honest

`POST /api/orders` reads no money from the request. Given a list of
`{slug, qty}` it:

1. Looks every product up in the database and uses the database price.
2. Drops anything hidden or out of stock, and clamps quantities to the shelf.
3. Works out delivery from settings and adds up the total server side.
4. Generates a unique order code, inserts the order and its lines, and
   decrements stock, all inside one transaction. If the last one sells out
   mid flight the whole order rolls back.
5. Replies with the order code and the total, nothing else.

Order lines copy the product name and unit price at the time of the order, so
editing or deleting a product never rewrites what a customer was charged.

All money is stored and calculated as an integer number of cents. There is no
float arithmetic anywhere in the codebase.

## Layout

```
app/
  (store)/          storefront pages, all force-dynamic
  admin/            the panel, noindex
  api/
    cart/           prices a basket, server side
    orders/         places an order
    admin/          session, setup, data, orders, products, settings, staff
  fonts/            self hosted woff2
  globals.css       theme tokens, four button identities, the hero room
components/         storefront and admin components
lib/
  db.ts             connection, schema, seed, typed queries
  orders.ts         order placement rules
  auth.ts           scrypt, signed session cookie
  money.ts          integer cents helpers
  cart.ts           localStorage basket
  uploads.ts        photo validation and writing
db/schema.sql       the schema, applied on first boot
```

## Notes for whoever picks this up

- The basket lives in `localStorage` and holds slugs and quantities only.
  Everything about price comes back from the server, so a basket edited in the
  console cannot change what anything costs.
- Storefront pages are `force-dynamic`. The owner edits prices and stock from
  the panel and expects to see the change on the next refresh.
- Uploaded photos are checked by their first bytes, not by the type the
  browser claims, before anything is written to a public folder.
- `PROJECT.md` in this folder is the handoff doc: brief, design decisions,
  what is built, and what is still open.
