import "server-only";

import {
  db,
  generateOrderCode,
  getSettings,
  type PaymentMethod,
  type Product,
} from "./db";
import { deliveryFor } from "./money";
import { clamp, isEmail, isPhone, toInt, trimmed } from "./validate";
import type { FieldErrors } from "./validate";

export type CartLineInput = { slug: string; qty: number };

export type PlaceOrderInput = {
  items: CartLineInput[];
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  payment_method: PaymentMethod;
  transfer_ref: string;
};

export type PlaceOrderResult =
  | { ok: true; code: string; total_cents: number }
  | { ok: false; message: string; errors?: FieldErrors };

const MAX_QTY_PER_LINE = 20;

/** Pulls a trusted order out of an untrusted request body. */
export function readOrderInput(body: unknown): PlaceOrderInput {
  const raw = (body ?? {}) as Record<string, unknown>;
  const rawItems = Array.isArray(raw.items) ? raw.items : [];

  const items: CartLineInput[] = [];
  for (const entry of rawItems.slice(0, 60)) {
    const line = (entry ?? {}) as Record<string, unknown>;
    const slug = trimmed(line.slug, 80);
    const qty = toInt(line.qty, 0);
    if (slug && qty > 0) items.push({ slug, qty });
  }

  const method = trimmed(raw.payment_method, 20);

  return {
    items,
    customer_name: trimmed(raw.customer_name, 120),
    phone: trimmed(raw.phone, 40),
    email: trimmed(raw.email, 160),
    address: trimmed(raw.address, 400),
    city: trimmed(raw.city, 80),
    notes: trimmed(raw.notes, 600),
    payment_method: method === "transfer" ? "transfer" : "cod",
    transfer_ref: trimmed(raw.transfer_ref, 80),
  };
}

/**
 * Places an order. Prices, stock and delivery all come from the database.
 * Nothing the browser sends about money is trusted or even read.
 */
export function placeOrder(input: PlaceOrderInput): PlaceOrderResult {
  const settings = getSettings();
  const errors: FieldErrors = {};

  if (!input.customer_name) errors.customer_name = "Tell us who to ask for.";
  if (!input.phone) errors.phone = "We need a phone number for the delivery.";
  else if (!isPhone(input.phone)) errors.phone = "That phone number looks off.";
  if (input.email && !isEmail(input.email))
    errors.email = "That email address looks off.";
  if (!input.address) errors.address = "Add a street and building.";
  if (!input.city) errors.city = "Add a city or area.";

  if (input.payment_method === "cod" && !settings.cod_enabled)
    errors.payment_method = "Cash on delivery is switched off right now.";
  if (input.payment_method === "transfer" && !settings.transfer_enabled)
    errors.payment_method = "Transfer is switched off right now.";
  if (input.payment_method === "transfer" && !input.transfer_ref)
    errors.transfer_ref = "Add the reference from your transfer receipt.";

  if (input.items.length === 0) {
    return { ok: false, message: "Your basket is empty." };
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Check the highlighted fields.", errors };
  }

  // Merge duplicate slugs so two lines of the same product cannot slip past
  // the stock check one at a time.
  const wanted = new Map<string, number>();
  for (const line of input.items) {
    wanted.set(line.slug, (wanted.get(line.slug) ?? 0) + line.qty);
  }

  const findProduct = db.prepare(
    "SELECT * FROM products WHERE slug = ? AND active = 1",
  );

  type Priced = { product: Product; qty: number };
  const priced: Priced[] = [];

  for (const [slug, requested] of wanted) {
    const product = findProduct.get(slug) as Product | undefined;

    // Anything hidden or sold out drops out of the order. The confirmation
    // page lists what was actually taken, so the customer sees the result.
    if (!product || product.stock <= 0) continue;

    priced.push({
      product,
      qty: clamp(requested, 1, Math.min(product.stock, MAX_QTY_PER_LINE)),
    });
  }

  if (priced.length === 0) {
    return {
      ok: false,
      message:
        "Nothing in your basket is available right now. Please empty it and start again.",
    };
  }

  const subtotal = priced.reduce(
    (sum, line) => sum + line.product.price_cents * line.qty,
    0,
  );
  const delivery = deliveryFor(
    subtotal,
    settings.delivery_fee_cents,
    settings.free_delivery_over_cents,
  );
  const total = subtotal + delivery;

  const write = db.transaction((): { code: string } => {
    const code = generateOrderCode();

    const orderId = Number(
      db
        .prepare(
          `INSERT INTO orders
             (code, customer_name, phone, email, address, city, notes,
              payment_method, transfer_ref, subtotal_cents, delivery_cents,
              total_cents, status)
           VALUES
             (@code, @customer_name, @phone, @email, @address, @city, @notes,
              @payment_method, @transfer_ref, @subtotal_cents, @delivery_cents,
              @total_cents, 'new')`,
        )
        .run({
          code,
          customer_name: input.customer_name,
          phone: input.phone,
          email: input.email,
          address: input.address,
          city: input.city,
          notes: input.notes,
          payment_method: input.payment_method,
          transfer_ref:
            input.payment_method === "transfer" ? input.transfer_ref : "",
          subtotal_cents: subtotal,
          delivery_cents: delivery,
          total_cents: total,
        }).lastInsertRowid,
    );

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, name, unit_cents, qty)
       VALUES (?, ?, ?, ?, ?)`,
    );
    const takeStock = db.prepare(
      "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
    );

    for (const line of priced) {
      insertItem.run(
        orderId,
        line.product.id,
        line.product.name,
        line.product.price_cents,
        line.qty,
      );

      const result = takeStock.run(line.qty, line.product.id, line.qty);
      if (result.changes !== 1) {
        // Someone else took the last one between the read and the write.
        // Throwing rolls the whole order back.
        throw new Error(`OUT_OF_STOCK:${line.product.name}`);
      }
    }

    return { code };
  });

  try {
    const { code } = write();
    return { ok: true, code, total_cents: total };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.startsWith("OUT_OF_STOCK:")) {
      return {
        ok: false,
        message: `${message.slice("OUT_OF_STOCK:".length)} just sold out. Please review your basket and try again.`,
      };
    }
    throw error;
  }
}
