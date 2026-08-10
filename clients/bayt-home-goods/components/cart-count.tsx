"use client";

import { countItems, useCart } from "@/lib/cart";

/** The number on the basket in the header. Blank until the basket loads. */
export function CartCount() {
  const { lines, hydrated } = useCart();
  const count = countItems(lines);

  if (!hydrated) {
    return (
      <span
        aria-hidden="true"
        className="skeleton ml-1 inline-block h-4 w-5 align-middle"
      />
    );
  }

  return (
    <span className="price-mono ml-1 tabular-nums">
      {count}
      <span className="sr-only"> items in your basket</span>
    </span>
  );
}
