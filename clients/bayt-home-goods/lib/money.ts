/**
 * Money helpers. Every amount in this app is an integer number of cents.
 * Nothing here ever produces or accepts a float.
 */

const SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export function currencySymbol(currency: string): string {
  return SYMBOLS[currency.toUpperCase()] ?? "";
}

/** 14500 -> "$145.00" */
export function formatMoney(cents: number, currency = "USD"): string {
  const symbol = currencySymbol(currency);
  const negative = cents < 0;
  const abs = Math.abs(Math.round(cents));
  const body = `${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
  const prefix = symbol || `${currency.toUpperCase()} `;
  return `${negative ? "-" : ""}${prefix}${body}`;
}

/** "145.00", "145", " 145.5 " -> 14500. Returns null for anything else. */
export function parseMoneyToCents(input: string): number | null {
  const trimmed = input.trim().replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;

  const [whole, fraction = ""] = trimmed.split(".");
  const cents =
    Number.parseInt(whole, 10) * 100 +
    Number.parseInt(fraction.padEnd(2, "0"), 10);

  return Number.isSafeInteger(cents) ? cents : null;
}

/** 14500 -> "145.00", for prefilling a price input in the admin panel. */
export function centsToInput(cents: number): string {
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
}

/**
 * Delivery is a flat fee that disappears once the basket passes the
 * free delivery threshold. A threshold of 0 means the fee always applies.
 */
export function deliveryFor(
  subtotalCents: number,
  feeCents: number,
  freeOverCents: number,
): number {
  if (subtotalCents <= 0) return 0;
  if (freeOverCents > 0 && subtotalCents >= freeOverCents) return 0;
  return feeCents;
}
