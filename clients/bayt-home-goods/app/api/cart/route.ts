import { db, getSettings, type Product } from "@/lib/db";
import { deliveryFor } from "@/lib/money";
import { clamp, toInt, trimmed } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type PricedLine = {
  slug: string;
  name: string;
  summary: string;
  image_path: string | null;
  unit_cents: number;
  qty: number;
  line_cents: number;
  stock: number;
  /** True when the browser asked for more than the shelf holds. */
  clamped: boolean;
};

export type CartPrice = {
  currency: string;
  lines: PricedLine[];
  /** Slugs that are no longer for sale, so the basket can offer to drop them. */
  unavailable: string[];
  subtotal_cents: number;
  delivery_cents: number;
  total_cents: number;
  delivery_fee_cents: number;
  free_delivery_over_cents: number;
  cod_enabled: boolean;
  transfer_enabled: boolean;
  transfer_number: string;
};

/**
 * Prices a basket. The browser sends slugs and quantities, and gets back
 * what those things actually cost according to the database.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const rawItems = Array.isArray(raw.items) ? raw.items.slice(0, 60) : [];
  const settings = getSettings();

  const wanted = new Map<string, number>();
  for (const entry of rawItems) {
    const line = (entry ?? {}) as Record<string, unknown>;
    const slug = trimmed(line.slug, 80);
    const qty = toInt(line.qty, 0);
    if (slug && qty > 0) wanted.set(slug, (wanted.get(slug) ?? 0) + qty);
  }

  const find = db.prepare("SELECT * FROM products WHERE slug = ? AND active = 1");

  const lines: PricedLine[] = [];
  const unavailable: string[] = [];

  for (const [slug, requested] of wanted) {
    const product = find.get(slug) as Product | undefined;

    if (!product || product.stock <= 0) {
      unavailable.push(slug);
      continue;
    }

    const qty = clamp(requested, 1, Math.min(product.stock, 20));

    lines.push({
      slug: product.slug,
      name: product.name,
      summary: product.summary,
      image_path: product.image_path,
      unit_cents: product.price_cents,
      qty,
      line_cents: product.price_cents * qty,
      stock: product.stock,
      clamped: qty < requested,
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.line_cents, 0);
  const delivery = deliveryFor(
    subtotal,
    settings.delivery_fee_cents,
    settings.free_delivery_over_cents,
  );

  const payload: CartPrice = {
    currency: settings.currency,
    lines,
    unavailable,
    subtotal_cents: subtotal,
    delivery_cents: delivery,
    total_cents: subtotal + delivery,
    delivery_fee_cents: settings.delivery_fee_cents,
    free_delivery_over_cents: settings.free_delivery_over_cents,
    cod_enabled: settings.cod_enabled,
    transfer_enabled: settings.transfer_enabled,
    transfer_number: settings.transfer_number,
  };

  return Response.json(payload);
}
