"use client";

import Link from "next/link";

import {
  CART_MAX_QTY,
  removeFromCart,
  setCartQty,
  useCart,
  writeCart,
} from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { ArrowRight, Close, Minus, Plus } from "./icons";
import { ProductPhoto } from "./product-photo";
import { usePricedCart } from "./use-priced-cart";

export function CartView() {
  const { price, ready, empty, failed, reload } = usePricedCart();
  const { lines: stored } = useCart();

  if (!ready) return <CartSkeleton />;

  if (failed) {
    return (
      <div className="border border-hairline bg-surface p-8">
        <h2 className="display-m">The basket could not be priced</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          The connection dropped before the shop could send back the prices.
          Nothing was lost from your basket.
        </p>
        <button type="button" onClick={reload} className="btn-wipe mt-6">
          <span>Try again</span>
        </button>
      </div>
    );
  }

  if (empty || !price || price.lines.length === 0) {
    return <EmptyBasket hadItems={!empty} onClear={() => writeCart([])} />;
  }

  const currency = price.currency;
  const shortOfFreeDelivery =
    price.free_delivery_over_cents > 0 &&
    price.subtotal_cents < price.free_delivery_over_cents
      ? price.free_delivery_over_cents - price.subtotal_cents
      : 0;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-7">
        {price.unavailable.length > 0 && (
          <div className="mb-6 border-l-2 border-accent bg-surface p-4">
            <p className="text-sm text-ink">
              {price.unavailable.length === 1
                ? "One item is no longer for sale and was left out."
                : `${price.unavailable.length} items are no longer for sale and were left out.`}
            </p>
            <button
              type="button"
              className="link-quiet mt-2 text-sm"
              onClick={() =>
                writeCart(
                  stored.filter(
                    (line) => !price.unavailable.includes(line.slug),
                  ),
                )
              }
            >
              Clear them from the basket
            </button>
          </div>
        )}

        <ul className="divide-y divide-hairline border-y border-hairline">
          {price.lines.map((line) => (
            <li key={line.slug} className="flex gap-4 py-5 sm:gap-6">
              <Link
                href={`/product/${line.slug}`}
                className="shrink-0"
                tabIndex={-1}
                aria-hidden="true"
              >
                <ProductPhoto
                  name={line.name}
                  imagePath={line.image_path}
                  sizes="96px"
                  showLabel={false}
                  className="h-24 w-20 sm:h-28 sm:w-24"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      href={`/product/${line.slug}`}
                      className="text-[1.0625rem] leading-tight tracking-tight text-ink transition-colors hover:text-accent"
                    >
                      {line.name}
                    </Link>
                    <p className="price-mono mt-1.5 text-sm text-muted">
                      {formatMoney(line.unit_cents, currency)} each
                    </p>
                    {line.clamped && (
                      <p className="mt-1.5 text-sm text-accent">
                        Only {line.stock} left, so the quantity came down.
                      </p>
                    )}
                  </div>

                  <p className="price-mono shrink-0 text-[1.0625rem] text-ink">
                    {formatMoney(line.line_cents, currency)}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="btn-step"
                      onClick={() => setCartQty(line.slug, line.qty - 1)}
                      disabled={line.qty <= 1}
                      aria-label={`One fewer ${line.name}`}
                    >
                      <Minus />
                    </button>
                    <span className="price-mono w-11 text-center">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      className="btn-step"
                      onClick={() => setCartQty(line.slug, line.qty + 1)}
                      disabled={line.qty >= Math.min(line.stock, CART_MAX_QTY)}
                      aria-label={`One more ${line.name}`}
                    >
                      <Plus />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(line.slug)}
                    className="link-quiet inline-flex items-center gap-1.5 text-sm"
                  >
                    <Close className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <Link href="/shop" className="link-quiet mt-6 inline-block text-sm">
          Keep shopping
        </Link>
      </div>

      <aside className="lg:col-span-5">
        <div className="bg-surface p-6 lg:sticky lg:top-24">
          <h2 className="label-mono text-muted">Basket total</h2>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Subtotal</dt>
              <dd className="price-mono text-ink">
                {formatMoney(price.subtotal_cents, currency)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Delivery</dt>
              <dd className="price-mono text-ink">
                {price.delivery_cents === 0
                  ? "Free"
                  : formatMoney(price.delivery_cents, currency)}
              </dd>
            </div>
          </dl>

          {shortOfFreeDelivery > 0 && (
            <p className="mt-4 border-l-2 border-accent/50 pl-3 text-sm text-muted">
              Add {formatMoney(shortOfFreeDelivery, currency)} more and delivery
              is free.
            </p>
          )}

          <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-hairline pt-5">
            <span className="text-ink">Total</span>
            <span className="price-mono text-2xl text-ink">
              {formatMoney(price.total_cents, currency)}
            </span>
          </div>

          <Link href="/checkout" className="btn-slab mt-7 w-full justify-center">
            Checkout
            <ArrowRight />
          </Link>

          <p className="mt-4 text-center text-sm text-muted">
            Nothing is charged online.
          </p>
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function CartSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14" aria-hidden="true">
      <div className="lg:col-span-7">
        <div className="divide-y divide-hairline border-y border-hairline">
          {[0, 1].map((row) => (
            <div key={row} className="flex gap-4 py-5 sm:gap-6">
              <div className="skeleton h-24 w-20 shrink-0 sm:h-28 sm:w-24" />
              <div className="flex flex-1 flex-col justify-between gap-3">
                <div className="flex justify-between gap-4">
                  <div className="w-full space-y-2">
                    <div className="skeleton h-4 w-2/5" />
                    <div className="skeleton h-3 w-1/5" />
                  </div>
                  <div className="skeleton h-4 w-16 shrink-0" />
                </div>
                <div className="skeleton h-11 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="space-y-4 bg-surface p-6">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-8 w-1/2" />
          <div className="skeleton h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

function EmptyBasket({
  hadItems,
  onClear,
}: {
  hadItems: boolean;
  onClear: () => void;
}) {
  return (
    <div className="border border-hairline bg-surface/40 px-6 py-16 text-center">
      <svg
        viewBox="0 0 120 90"
        className="mx-auto h-24 w-32 text-hairline"
        aria-hidden="true"
      >
        <path
          d="M22 34h76l-8 44H30Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M28 48h64M31 62h58"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <path
          d="M40 34c0-12 8-20 20-20s20 8 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>

      <h2 className="display-m mt-6">Your basket is empty</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
        {hadItems
          ? "Everything that was in here has sold out. The shelves are restocked most weeks."
          : "Add a few things and they will wait here, even if you close the tab."}
      </p>

      <div className="mt-8 flex flex-col items-center gap-4">
        <Link href="/shop" className="btn-slab">
          Shop all
          <ArrowRight />
        </Link>
        {hadItems && (
          <button type="button" onClick={onClear} className="link-quiet text-sm">
            Empty the basket
          </button>
        )}
      </div>
    </div>
  );
}
