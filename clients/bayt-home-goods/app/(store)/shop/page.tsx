import type { Metadata } from "next";
import Link from "next/link";

import { ArrowRight } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import {
  getCategoryBySlug,
  getSettings,
  listCategories,
  listProducts,
} from "@/lib/db";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Every piece in the shop: ceramics and kitchen things, washed linen, lamps, baskets and storage.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: requested } = await searchParams;

  const settings = getSettings();
  const categories = listCategories();
  const active = requested ? getCategoryBySlug(requested) : undefined;
  const categorySlug = active?.slug;
  const products = listProducts({ categorySlug });

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="label-mono text-accent">The shop</p>
      <h1 className="display-l mt-4">{active ? active.name : "Everything"}</h1>
      <p className="mt-4 max-w-xl leading-relaxed text-muted">
        {active
          ? active.blurb
          : "Everything on the shelves right now. Pick a shelf to narrow it down."}
      </p>

      {/* Category chips */}
      <div className="mt-9 flex flex-wrap gap-2">
        <Chip href="/shop" label="All" active={!active} />
        {categories.map((entry) => (
          <Chip
            key={entry.id}
            href={`/shop?category=${entry.slug}`}
            label={entry.name}
            active={active?.slug === entry.slug}
          />
        ))}
      </div>

      <p className="label-mono mt-8 text-muted">
        {products.length} {products.length === 1 ? "item" : "items"}
      </p>

      {products.length > 0 ? (
        <div className="hairline-grid mt-5 grid sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              currency={settings.currency}
              priority={index < 3}
            />
          ))}
        </div>
      ) : (
        <EmptyShelf categoryName={active?.name} />
      )}
    </div>
  );
}

function Chip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "border border-accent bg-accent px-4 py-2 text-sm font-medium text-ground"
          : "border border-hairline px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-ink"
      }
    >
      {label}
    </Link>
  );
}

/** Composed empty state. A drawn shelf with nothing on it, and a way out. */
function EmptyShelf({ categoryName }: { categoryName?: string }) {
  return (
    <div className="mt-5 border border-hairline bg-surface/40 px-6 py-16 text-center">
      <svg
        viewBox="0 0 200 90"
        className="mx-auto h-20 w-44 text-hairline"
        aria-hidden="true"
      >
        <rect x="10" y="62" width="180" height="3" fill="currentColor" />
        <rect x="16" y="65" width="6" height="18" fill="currentColor" />
        <rect x="178" y="65" width="6" height="18" fill="currentColor" />
        <path
          d="M60 62V40M100 62V32M140 62V44"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 5"
        />
      </svg>

      <h2 className="display-m mt-6">
        {categoryName ? `${categoryName} is empty` : "This shelf is empty"}
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
        Nothing is in stock here at the moment. New pieces arrive most weeks, so
        it is worth checking the other shelves.
      </p>

      <Link href="/shop" className="btn-slab mt-8 inline-flex">
        Shop all
        <ArrowRight />
      </Link>
    </div>
  );
}
