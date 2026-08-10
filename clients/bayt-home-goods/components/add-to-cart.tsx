"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { addToCart, CART_MAX_QTY } from "@/lib/cart";
import { Check, Minus, Plus } from "./icons";

export function AddToCart({
  slug,
  stock,
  name,
}: {
  slug: string;
  stock: number;
  name: string;
}) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const max = Math.max(1, Math.min(stock, CART_MAX_QTY));

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (stock <= 0) {
    return (
      <div className="border border-hairline bg-surface p-5">
        <p className="text-ink">This one is sold out.</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Call the shop and we will tell you when the next batch lands.
        </p>
      </div>
    );
  }

  function add() {
    addToCart(slug, qty);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2600);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center">
          <button
            type="button"
            className="btn-step"
            onClick={() => setQty((current) => Math.max(1, current - 1))}
            disabled={qty <= 1}
            aria-label={`One fewer ${name}`}
          >
            <Minus />
          </button>
          <span
            className="price-mono w-12 text-center text-lg"
            aria-live="polite"
            aria-label={`Quantity ${qty}`}
          >
            {qty}
          </span>
          <button
            type="button"
            className="btn-step"
            onClick={() => setQty((current) => Math.min(max, current + 1))}
            disabled={qty >= max}
            aria-label={`One more ${name}`}
          >
            <Plus />
          </button>
        </div>

        <button type="button" onClick={add} className="btn-wipe flex-1 sm:flex-none">
          <span>Add to basket</span>
        </button>
      </div>

      <p className="mt-4 flex min-h-6 items-center gap-2 text-sm" aria-live="polite">
        {added ? (
          <>
            <Check className="h-4 w-4 text-accent" />
            <span className="text-ink">In your basket.</span>
            <Link href="/cart" className="link-quiet">
              Go to the basket
            </Link>
          </>
        ) : (
          <span className="text-muted">
            {stock <= 5
              ? `Only ${stock} left on the shelf.`
              : `${stock} in stock.`}
          </span>
        )}
      </p>
    </div>
  );
}
