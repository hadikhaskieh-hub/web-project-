"use client";

import { useEffect, useState } from "react";

import type { CartPrice } from "@/app/api/cart/route";
import { useCart } from "@/lib/cart";

export type CartState = {
  /** Null until the basket has been priced, or when it is empty. */
  price: CartPrice | null;
  /** False while localStorage and the pricing call are still in flight. */
  ready: boolean;
  empty: boolean;
  failed: boolean;
  reload: () => void;
};

/**
 * Reads the basket out of localStorage and asks the server what it costs.
 * The browser never adds anything up itself.
 */
export function usePricedCart(): CartState {
  const { lines, hydrated } = useCart();
  const [price, setPrice] = useState<CartPrice | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!hydrated) return;

    if (lines.length === 0) {
      setPrice(null);
      setFailed(false);
      setReady(true);
      return;
    }

    let cancelled = false;
    setFailed(false);

    fetch("/api/cart", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: lines }),
    })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<CartPrice>;
      })
      .then((data) => {
        if (cancelled) return;
        setPrice(data);
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
        setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, lines, attempt]);

  return {
    price,
    ready,
    empty: hydrated && lines.length === 0,
    failed,
    reload: () => setAttempt((n) => n + 1),
  };
}
