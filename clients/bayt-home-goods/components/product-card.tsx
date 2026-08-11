import Link from "next/link";

import type { ProductWithCategory } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { ProductPhoto } from "./product-photo";

export function ProductCard({
  product,
  currency,
  priority = false,
}: {
  product: ProductWithCategory;
  currency: string;
  priority?: boolean;
}) {
  const soldOut = product.stock <= 0;
  const onOffer =
    product.compare_cents !== null && product.compare_cents > product.price_cents;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-surface transition-colors duration-200 hover:bg-hairline/60"
    >
      <div className="relative aspect-4/5 overflow-hidden">
        <ProductPhoto
          name={product.name}
          imagePath={product.image_path}
          slug={product.slug}
          categorySlug={product.category_slug}
          priority={priority}
          className="absolute inset-0 h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
        {soldOut && (
          <span className="label-mono absolute left-0 top-0 bg-ground/85 px-3 py-2 text-muted">
            Sold out
          </span>
        )}
        {!soldOut && onOffer && (
          <span className="label-mono absolute left-0 top-0 bg-accent px-3 py-2 text-ground">
            Reduced
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-4 border-t border-hairline p-4">
        <div className="min-w-0">
          <h3 className="text-[1.0625rem] leading-tight tracking-tight text-ink">
            {product.name}
          </h3>
          {product.category_name && (
            <p className="label-mono mt-2 text-muted">{product.category_name}</p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="price-mono text-[1.0625rem] text-ink">
            {formatMoney(product.price_cents, currency)}
          </p>
          {onOffer && (
            <p className="price-mono mt-1 text-xs text-muted line-through">
              {formatMoney(product.compare_cents as number, currency)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
