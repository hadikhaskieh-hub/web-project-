import Link from "next/link";

import { getSettings, listCategories } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export function SiteFooter() {
  const settings = getSettings();
  const categories = listCategories();

  return (
    <footer className="mt-24 border-t border-hairline">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-2xl font-medium tracking-tighter">
              {settings.store_name}
            </p>
            <p className="mt-3 max-w-56 text-sm leading-relaxed text-muted">
              Home goods for Beirut apartments. Open Tuesday to Saturday, eleven
              to seven, on Armenia Street.
            </p>
          </div>

          <div>
            <p className="label-mono text-muted">Shop</p>
            <ul className="mt-4 space-y-2.5">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/shop?category=${category.slug}`}
                    className="text-sm text-ink/85 transition-colors hover:text-accent"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label-mono text-muted">Ordering</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/how-it-works"
                  className="text-ink/85 transition-colors hover:text-accent"
                >
                  How ordering works
                </Link>
              </li>
              <li className="text-muted">
                Delivery {formatMoney(settings.delivery_fee_cents, settings.currency)}
                {settings.free_delivery_over_cents > 0 && (
                  <>
                    , free over{" "}
                    {formatMoney(
                      settings.free_delivery_over_cents,
                      settings.currency,
                    )}
                  </>
                )}
              </li>
              <li className="text-muted">
                {[
                  settings.cod_enabled ? "Cash on delivery" : null,
                  settings.transfer_enabled ? "Transfer" : null,
                ]
                  .filter(Boolean)
                  .join(" or ") || "Payment methods are being updated"}
              </li>
            </ul>
          </div>

          <div>
            <p className="label-mono text-muted">Reach us</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href={`tel:${settings.store_phone.replace(/\s/g, "")}`}
                  className="price-mono text-ink/85 transition-colors hover:text-accent"
                >
                  {settings.store_phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.store_email}`}
                  className="text-ink/85 transition-colors hover:text-accent"
                >
                  {settings.store_email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="label-mono text-muted">
            {settings.store_name}, Mar Mikhael
          </p>
          <Link href="/admin" className="link-quiet label-mono">
            Staff sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
