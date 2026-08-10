import "server-only";

import Database from "better-sqlite3";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { OrderStatus, PaymentMethod } from "./order-status";

/* ------------------------------------------------------------------ *\
   Connection
\* ------------------------------------------------------------------ */

const DB_PATH =
  process.env.BAYT_DB_PATH ?? path.join(process.cwd(), "db", "shop.db");

// Next reloads modules constantly in dev. Keep one connection on globalThis
// so we do not open a new file handle on every hot reload.
const globalForDb = globalThis as unknown as { baytDb?: Database.Database };

function connect(): Database.Database {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  const conn = new Database(DB_PATH);
  conn.pragma("journal_mode = WAL");
  conn.pragma("foreign_keys = ON");

  const schema = fs.readFileSync(
    path.join(process.cwd(), "db", "schema.sql"),
    "utf8",
  );
  conn.exec(schema);

  seed(conn);
  return conn;
}

/* ------------------------------------------------------------------ *\
   Types
\* ------------------------------------------------------------------ */

export type Category = {
  id: number;
  slug: string;
  name: string;
  blurb: string;
  position: number;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  summary: string;
  description: string;
  price_cents: number;
  compare_cents: number | null;
  category_id: number | null;
  image_path: string | null;
  stock: number;
  featured: number;
  active: number;
  created_at: string;
};

export type ProductWithCategory = Product & {
  category_name: string | null;
  category_slug: string | null;
};

export type Staff = {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  role: string;
  created_at: string;
};

export {
  ORDER_STATUSES,
  STATUS_LABELS,
  type OrderStatus,
  type PaymentMethod,
} from "./order-status";

export type Order = {
  id: number;
  code: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  payment_method: PaymentMethod;
  transfer_ref: string;
  subtotal_cents: number;
  delivery_cents: number;
  total_cents: number;
  status: OrderStatus;
  created_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number | null;
  name: string;
  unit_cents: number;
  qty: number;
};

export type OrderWithItems = Order & { items: OrderItem[] };

export type Settings = {
  store_name: string;
  currency: string;
  delivery_fee_cents: number;
  free_delivery_over_cents: number;
  transfer_number: string;
  store_phone: string;
  store_email: string;
  cod_enabled: boolean;
  transfer_enabled: boolean;
};

/* ------------------------------------------------------------------ *\
   Seed
\* ------------------------------------------------------------------ */

const DEFAULT_SETTINGS: Record<string, string> = {
  store_name: "Bayt",
  currency: "USD",
  delivery_fee_cents: "400",
  free_delivery_over_cents: "6000",
  // Placeholders. The owner replaces these in Settings before launch.
  transfer_number: "+961 71 000 000",
  store_phone: "+961 1 000 000",
  store_email: "hello@bayt.example",
  cod_enabled: "1",
  transfer_enabled: "1",
};

const SEED_CATEGORIES: Omit<Category, "id">[] = [
  {
    slug: "table-and-kitchen",
    name: "Table and Kitchen",
    blurb: "Plates, bowls, boards and pots that go straight from oven to table.",
    position: 1,
  },
  {
    slug: "linen",
    name: "Linen",
    blurb: "Washed flax for the bed, the bath and the kitchen drawer.",
    position: 2,
  },
  {
    slug: "light",
    name: "Light",
    blurb: "Lamps and shades for the corners a ceiling bulb never reaches.",
    position: 3,
  },
  {
    slug: "baskets",
    name: "Baskets and Storage",
    blurb: "Hand woven palm and rattan for everything without a shelf.",
    position: 4,
  },
];

type SeedProduct = Omit<
  Product,
  "id" | "category_id" | "created_at" | "image_path"
> & { category_slug: string };

const SEED_PRODUCTS: SeedProduct[] = [
  {
    slug: "stoneware-dinner-plate",
    name: "Stoneware dinner plate",
    summary: "Sand glaze, 27 cm, thrown in Beit Chabab.",
    description:
      "A wide everyday plate with a low rim, glazed in a soft sand colour that leaves the clay visible at the foot. Twenty seven centimetres across, which is enough for a full plate of rice without anything sliding off. Each one is thrown by hand, so the weight and the glaze pooling differ slightly from plate to plate. Dishwasher and oven safe up to 220 degrees.",
    price_cents: 1800,
    compare_cents: null,
    stock: 24,
    featured: 1,
    active: 1,
    category_slug: "table-and-kitchen",
  },
  {
    slug: "olive-wood-serving-board",
    name: "Olive wood serving board",
    summary: "One piece of Koura olive wood, 40 cm long.",
    description:
      "Cut from a single piece of olive wood from a grove in Koura, sanded smooth and finished with food safe mineral oil. Forty centimetres long with a cut out handle, so it works as a bread board on the counter and a cheese board on the table. The grain pattern is different on every board. Wipe it with a damp cloth and re oil it a few times a year. Do not put it in the dishwasher.",
    price_cents: 3400,
    compare_cents: 4200,
    stock: 11,
    featured: 1,
    active: 1,
    category_slug: "table-and-kitchen",
  },
  {
    slug: "washed-linen-duvet-cover",
    name: "Washed linen duvet cover",
    summary: "Stonewashed flax, double bed, oat colour.",
    description:
      "A double duvet cover in stonewashed European flax, already softened so it feels broken in the first night you use it. Oat coloured, with coconut shell buttons along the bottom edge and interior ties at the corners. Fits a 200 by 200 centimetre duvet. Linen breathes, so it stays cool through August and warm in January. Machine wash cold and tumble dry low, and it gets softer every wash.",
    price_cents: 14500,
    compare_cents: null,
    stock: 6,
    featured: 1,
    active: 1,
    category_slug: "linen",
  },
  {
    slug: "linen-kitchen-towels",
    name: "Linen kitchen towels, pair",
    summary: "Two heavyweight towels with a hanging loop.",
    description:
      "A pair of heavyweight linen towels, 50 by 70 centimetres, with a hanging loop stitched into one corner. One is plain oat, one has a single rust stripe, so you can keep one for hands and one for glassware. Linen dries glasses without leaving lint behind, which cotton does not manage. They arrive stiff and soften after two or three washes.",
    price_cents: 2200,
    compare_cents: null,
    stock: 30,
    featured: 0,
    active: 1,
    category_slug: "linen",
  },
  {
    slug: "rattan-dome-pendant",
    name: "Rattan dome pendant",
    summary: "Woven shade, 45 cm wide, two metre cord.",
    description:
      "A hand woven rattan dome that throws a pattern of soft shadows across the ceiling once the bulb is on. Forty five centimetres wide with a black fabric cord two metres long and a matching ceiling rose. Takes any E27 bulb, and a warm 2700K bulb suits it best. Sold without a bulb. Hang it low over a dining table or in a stairwell where the shadows have room to spread.",
    price_cents: 7800,
    compare_cents: null,
    stock: 8,
    featured: 1,
    active: 1,
    category_slug: "light",
  },
  {
    slug: "ceramic-table-lamp",
    name: "Ceramic table lamp",
    summary: "Sand glaze base with a cotton shade, 42 cm tall.",
    description:
      "A rounded ceramic base in the same sand glaze as our tableware, topped with an unbleached cotton drum shade. Forty two centimetres tall, so it sits well on a bedside table or a hallway console. Braided cloth cord with an inline switch you can reach without leaning over. Takes an E14 bulb, not included. The glaze is fired twice, which is why the base has a little weight to it and does not tip.",
    price_cents: 9600,
    compare_cents: 11500,
    stock: 5,
    featured: 0,
    active: 1,
    category_slug: "light",
  },
  {
    slug: "palm-leaf-market-basket",
    name: "Palm leaf market basket",
    summary: "Woven palm with leather handles, holds a full shop.",
    description:
      "A flat bottomed market basket woven from dried palm leaf, with two stitched leather handles that sit comfortably over a shoulder. Forty centimetres wide and thirty tall, which takes a full vegetable shop from Souk el Tayeb with room left over. Also works as a magazine basket next to a chair. The weave loosens slightly with use and holds its shape.",
    price_cents: 4200,
    compare_cents: null,
    stock: 14,
    featured: 0,
    active: 1,
    category_slug: "baskets",
  },
  {
    slug: "tall-storage-basket",
    name: "Tall storage basket",
    summary: "Seagrass, 55 cm tall, for blankets or laundry.",
    description:
      "A tall seagrass basket with a folded rim that keeps the sides upright even when it is empty. Fifty five centimetres tall and forty across, which swallows a folded winter duvet or a week of laundry. Sturdy enough to be dragged across a tiled floor. The natural colour lightens over a year in a sunny room, and that is normal for seagrass.",
    price_cents: 5600,
    compare_cents: null,
    stock: 9,
    featured: 0,
    active: 1,
    category_slug: "baskets",
  },
];

function seed(conn: Database.Database) {
  const insertSetting = conn.prepare(
    "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
  );
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    insertSetting.run(key, value);
  }

  const categoryCount = conn
    .prepare("SELECT COUNT(*) AS n FROM categories")
    .get() as { n: number };

  if (categoryCount.n === 0) {
    const insertCategory = conn.prepare(
      "INSERT INTO categories (slug, name, blurb, position) VALUES (@slug, @name, @blurb, @position)",
    );
    conn.transaction(() => {
      for (const category of SEED_CATEGORIES) insertCategory.run(category);
    })();
  }

  const productCount = conn
    .prepare("SELECT COUNT(*) AS n FROM products")
    .get() as { n: number };

  if (productCount.n === 0) {
    const findCategory = conn.prepare(
      "SELECT id FROM categories WHERE slug = ?",
    );
    const insertProduct = conn.prepare(`
      INSERT INTO products
        (slug, name, summary, description, price_cents, compare_cents,
         category_id, image_path, stock, featured, active)
      VALUES
        (@slug, @name, @summary, @description, @price_cents, @compare_cents,
         @category_id, NULL, @stock, @featured, @active)
    `);
    conn.transaction(() => {
      for (const { category_slug, ...product } of SEED_PRODUCTS) {
        const row = findCategory.get(category_slug) as
          | { id: number }
          | undefined;
        insertProduct.run({ ...product, category_id: row?.id ?? null });
      }
    })();
  }
}

/**
 * The open connection. Declared here, below the seed data, because opening
 * it runs the seed and the seed reads the constants above.
 */
export const db: Database.Database = (globalForDb.baytDb ??= connect());

/* ------------------------------------------------------------------ *\
   Settings
\* ------------------------------------------------------------------ */

export function getSettings(): Settings {
  const rows = db.prepare("SELECT key, value FROM settings").all() as {
    key: string;
    value: string;
  }[];

  const map: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows) map[row.key] = row.value;

  const int = (key: string) => {
    const parsed = Number.parseInt(map[key] ?? "", 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return {
    store_name: map.store_name,
    currency: map.currency,
    delivery_fee_cents: int("delivery_fee_cents"),
    free_delivery_over_cents: int("free_delivery_over_cents"),
    transfer_number: map.transfer_number,
    store_phone: map.store_phone,
    store_email: map.store_email,
    cod_enabled: map.cod_enabled === "1",
    transfer_enabled: map.transfer_enabled === "1",
  };
}

export function saveSettings(values: Record<string, string>) {
  const statement = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  );
  db.transaction(() => {
    for (const [key, value] of Object.entries(values)) statement.run(key, value);
  })();
}

/* ------------------------------------------------------------------ *\
   Categories
\* ------------------------------------------------------------------ */

export function listCategories(): Category[] {
  return db
    .prepare("SELECT * FROM categories ORDER BY position, name")
    .all() as Category[];
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return db.prepare("SELECT * FROM categories WHERE slug = ?").get(slug) as
    | Category
    | undefined;
}

export function countActiveProductsByCategory(): Record<number, number> {
  const rows = db
    .prepare(
      "SELECT category_id AS id, COUNT(*) AS n FROM products WHERE active = 1 AND category_id IS NOT NULL GROUP BY category_id",
    )
    .all() as { id: number; n: number }[];

  const counts: Record<number, number> = {};
  for (const row of rows) counts[row.id] = row.n;
  return counts;
}

/* ------------------------------------------------------------------ *\
   Products
\* ------------------------------------------------------------------ */

const PRODUCT_SELECT = `
  SELECT p.*, c.name AS category_name, c.slug AS category_slug
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
`;

export function listProducts(options: {
  categorySlug?: string;
  featuredOnly?: boolean;
  includeHidden?: boolean;
  limit?: number;
  excludeId?: number;
} = {}): ProductWithCategory[] {
  const where: string[] = [];
  const params: (string | number)[] = [];

  if (!options.includeHidden) where.push("p.active = 1");
  if (options.featuredOnly) where.push("p.featured = 1");
  if (options.categorySlug) {
    where.push("c.slug = ?");
    params.push(options.categorySlug);
  }
  if (options.excludeId !== undefined) {
    where.push("p.id != ?");
    params.push(options.excludeId);
  }

  let sql = PRODUCT_SELECT;
  if (where.length) sql += ` WHERE ${where.join(" AND ")}`;
  sql += " ORDER BY p.featured DESC, p.created_at DESC, p.id DESC";
  if (options.limit !== undefined) {
    sql += " LIMIT ?";
    params.push(options.limit);
  }

  return db.prepare(sql).all(...params) as ProductWithCategory[];
}

export function getProductBySlug(
  slug: string,
  options: { includeHidden?: boolean } = {},
): ProductWithCategory | undefined {
  const sql = `${PRODUCT_SELECT} WHERE p.slug = ?${
    options.includeHidden ? "" : " AND p.active = 1"
  }`;
  return db.prepare(sql).get(slug) as ProductWithCategory | undefined;
}

export function getProductById(id: number): ProductWithCategory | undefined {
  return db.prepare(`${PRODUCT_SELECT} WHERE p.id = ?`).get(id) as
    | ProductWithCategory
    | undefined;
}

export type ProductInput = {
  name: string;
  summary: string;
  description: string;
  price_cents: number;
  compare_cents: number | null;
  category_id: number | null;
  image_path: string | null;
  stock: number;
  featured: number;
  active: number;
};

export function createProduct(input: ProductInput & { slug: string }): number {
  const result = db
    .prepare(
      `INSERT INTO products
         (slug, name, summary, description, price_cents, compare_cents,
          category_id, image_path, stock, featured, active)
       VALUES
         (@slug, @name, @summary, @description, @price_cents, @compare_cents,
          @category_id, @image_path, @stock, @featured, @active)`,
    )
    .run(input);
  return Number(result.lastInsertRowid);
}

export function updateProduct(id: number, input: ProductInput) {
  db.prepare(
    `UPDATE products SET
       name = @name,
       summary = @summary,
       description = @description,
       price_cents = @price_cents,
       compare_cents = @compare_cents,
       category_id = @category_id,
       image_path = @image_path,
       stock = @stock,
       featured = @featured,
       active = @active
     WHERE id = @id`,
  ).run({ ...input, id });
}

export function deleteProduct(id: number) {
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
}

/** Turns a product name into a URL slug that is not already taken. */
export function uniqueProductSlug(name: string, ignoreId?: number): string {
  const base =
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "product";

  const taken = db.prepare(
    ignoreId === undefined
      ? "SELECT 1 FROM products WHERE slug = ?"
      : "SELECT 1 FROM products WHERE slug = ? AND id != ?",
  );

  let candidate = base;
  let n = 2;
  while (
    (ignoreId === undefined
      ? taken.get(candidate)
      : taken.get(candidate, ignoreId)) !== undefined
  ) {
    candidate = `${base}-${n++}`;
  }
  return candidate;
}

/* ------------------------------------------------------------------ *\
   Staff and sessions
\* ------------------------------------------------------------------ */

export function countStaff(): number {
  return (db.prepare("SELECT COUNT(*) AS n FROM staff").get() as { n: number })
    .n;
}

export function listStaff(): Omit<Staff, "password_hash">[] {
  return db
    .prepare("SELECT id, email, name, role, created_at FROM staff ORDER BY id")
    .all() as Omit<Staff, "password_hash">[];
}

export function getStaffByEmail(email: string): Staff | undefined {
  return db
    .prepare("SELECT * FROM staff WHERE email = ?")
    .get(email.toLowerCase()) as Staff | undefined;
}

export function createStaff(input: {
  email: string;
  name: string;
  password_hash: string;
  role: string;
}): number {
  const result = db
    .prepare(
      "INSERT INTO staff (email, name, password_hash, role) VALUES (@email, @name, @password_hash, @role)",
    )
    .run({ ...input, email: input.email.toLowerCase() });
  return Number(result.lastInsertRowid);
}

export function createSession(staffId: number, days = 14): string {
  const id = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + days * 86_400_000).toISOString();
  db.prepare(
    "INSERT INTO sessions (id, staff_id, expires_at) VALUES (?, ?, ?)",
  ).run(id, staffId, expires);
  return id;
}

export function getSessionStaff(
  sessionId: string,
): Omit<Staff, "password_hash"> | undefined {
  const row = db
    .prepare(
      `SELECT s.id AS session_id, s.expires_at, st.id, st.email, st.name, st.role, st.created_at
       FROM sessions s JOIN staff st ON st.id = s.staff_id
       WHERE s.id = ?`,
    )
    .get(sessionId) as
    | (Omit<Staff, "password_hash"> & {
        session_id: string;
        expires_at: string;
      })
    | undefined;

  if (!row) return undefined;

  if (new Date(row.expires_at).getTime() < Date.now()) {
    deleteSession(sessionId);
    return undefined;
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    created_at: row.created_at,
  };
}

export function deleteSession(sessionId: string) {
  db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
}

/* ------------------------------------------------------------------ *\
   Orders
\* ------------------------------------------------------------------ */

export function listOrders(): OrderWithItems[] {
  const orders = db
    .prepare("SELECT * FROM orders ORDER BY id DESC")
    .all() as Order[];

  if (orders.length === 0) return [];

  const items = db
    .prepare("SELECT * FROM order_items ORDER BY id")
    .all() as OrderItem[];

  const byOrder = new Map<number, OrderItem[]>();
  for (const item of items) {
    const list = byOrder.get(item.order_id);
    if (list) list.push(item);
    else byOrder.set(item.order_id, [item]);
  }

  return orders.map((order) => ({
    ...order,
    items: byOrder.get(order.id) ?? [],
  }));
}

export function getOrderByCode(code: string): OrderWithItems | undefined {
  const order = db
    .prepare("SELECT * FROM orders WHERE code = ?")
    .get(code.toUpperCase()) as Order | undefined;

  if (!order) return undefined;

  const items = db
    .prepare("SELECT * FROM order_items WHERE order_id = ? ORDER BY id")
    .all(order.id) as OrderItem[];

  return { ...order, items };
}

export function setOrderStatus(code: string, status: OrderStatus) {
  db.prepare("UPDATE orders SET status = ? WHERE code = ?").run(
    status,
    code.toUpperCase(),
  );
}

/**
 * Order codes read out loud over the phone, so the alphabet skips the
 * characters people mix up: no O against 0, no I or L against 1.
 */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateOrderCode(): string {
  const exists = db.prepare("SELECT 1 FROM orders WHERE code = ?");

  for (let attempt = 0; attempt < 40; attempt++) {
    const bytes = randomBytes(6);
    let code = "BY";
    for (const byte of bytes) code += CODE_ALPHABET[byte % CODE_ALPHABET.length];
    if (exists.get(code) === undefined) return code;
  }

  throw new Error("Could not generate a free order code");
}
