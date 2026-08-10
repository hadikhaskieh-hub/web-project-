"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * The basket lives in localStorage so it survives a closed tab. It holds
 * slugs and quantities only. Prices, stock and totals always come back
 * from the server, so a tampered basket cannot change what anything costs.
 */

export type CartLine = { slug: string; qty: number };

const KEY = "bayt_cart_v1";
const CHANGED = "bayt:cart-changed";
const MAX_QTY = 20;
const EMPTY: CartLine[] = [];

function parse(raw: string | null): CartLine[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;

    const lines: CartLine[] = [];
    for (const entry of parsed) {
      const slug = (entry as CartLine)?.slug;
      const qty = Number((entry as CartLine)?.qty);
      if (typeof slug === "string" && slug && Number.isFinite(qty) && qty > 0) {
        lines.push({ slug, qty: Math.min(Math.trunc(qty), MAX_QTY) });
      }
    }
    return lines;
  } catch {
    return EMPTY;
  }
}

/* useSyncExternalStore needs a stable reference, so the parsed value is
   cached and only rebuilt when the stored string actually changes. */
let cachedRaw: string | null = null;
let cachedLines: CartLine[] = EMPTY;
let primed = false;

function snapshot(): CartLine[] {
  const raw = window.localStorage.getItem(KEY);
  if (!primed || raw !== cachedRaw) {
    cachedRaw = raw;
    cachedLines = parse(raw);
    primed = true;
  }
  return cachedLines;
}

function serverSnapshot(): CartLine[] {
  return EMPTY;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGED, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGED, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return EMPTY;
  return snapshot();
}

export function writeCart(lines: CartLine[]) {
  if (typeof window === "undefined") return;
  const clean = lines.filter((line) => line.qty > 0);
  window.localStorage.setItem(KEY, JSON.stringify(clean));
  window.dispatchEvent(new Event(CHANGED));
}

export function addToCart(slug: string, qty = 1) {
  const lines = readCart().slice();
  const existing = lines.find((line) => line.slug === slug);

  if (existing) existing.qty = Math.min(existing.qty + qty, MAX_QTY);
  else lines.push({ slug, qty: Math.min(qty, MAX_QTY) });

  writeCart(lines);
}

export function setCartQty(slug: string, qty: number) {
  const next = readCart()
    .map((line) =>
      line.slug === slug
        ? { ...line, qty: Math.max(0, Math.min(qty, MAX_QTY)) }
        : line,
    )
    .filter((line) => line.qty > 0);

  writeCart(next);
}

export function removeFromCart(slug: string) {
  writeCart(readCart().filter((line) => line.slug !== slug));
}

export function clearCart() {
  writeCart([]);
}

export function countItems(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.qty, 0);
}

/**
 * Returns the basket plus a hydrated flag. Before hydration the flag is
 * false, which is what the skeletons key off, so the server and client
 * first render agree.
 */
export function useCart(): { lines: CartLine[]; hydrated: boolean } {
  const lines = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  return { lines, hydrated };
}

export const CART_MAX_QTY = MAX_QTY;
