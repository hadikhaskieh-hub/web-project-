import Link from "next/link";

import { getSettings } from "@/lib/db";
import { CartCount } from "./cart-count";
import { Basket } from "./icons";

export function SiteHeader() {
  const settings = getSettings();

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-ground/92 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-baseline gap-2 text-xl font-medium tracking-tighter text-ink"
        >
          {settings.store_name}
          <span className="label-mono hidden text-accent sm:inline">Beirut</span>
        </Link>

        <nav className="flex items-center gap-5 sm:gap-7">
          <Link
            href="/shop"
            className="text-sm text-muted transition-colors hover:text-ink"
          >
            Shop
          </Link>
          <Link
            href="/how-it-works"
            className="text-sm text-muted transition-colors hover:text-ink"
          >
            How it works
          </Link>
          <Link
            href="/cart"
            className="flex items-center gap-1.5 border border-hairline px-3 py-2 text-sm text-ink transition-colors hover:border-accent"
          >
            <Basket className="h-4 w-4" />
            <CartCount />
          </Link>
        </nav>
      </div>
    </header>
  );
}
