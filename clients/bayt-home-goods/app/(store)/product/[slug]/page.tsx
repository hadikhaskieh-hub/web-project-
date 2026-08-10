import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCart } from "@/components/add-to-cart";
import { ArrowLeft } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { ProductPhoto } from "@/components/product-photo";
import { getProductBySlug, getSettings, listProducts } from "@/lib/db";
import { formatMoney } from "@/lib/money";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) return { title: "Not found" };

  return {
    title: product.name,
    description: product.summary || product.description.slice(0, 155),
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  const settings = getSettings();
  const related = product.category_slug
    ? listProducts({
        categorySlug: product.category_slug,
        excludeId: product.id,
        limit: 3,
      })
    : [];

  const onOffer =
    product.compare_cents !== null && product.compare_cents > product.price_cents;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <Link href="/shop" className="link-quiet inline-flex items-center gap-2 text-sm">
        <ArrowLeft className="h-4 w-4" />
        Back to the shop
      </Link>

      {/* Asymmetric split: photo, then everything you need to decide. */}
      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <ProductPhoto
            name={product.name}
            imagePath={product.image_path}
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="aspect-4/3 w-full"
          />
        </div>

        <div className="lg:col-span-5">
          {product.category_name && (
            <Link
              href={`/shop?category=${product.category_slug}`}
              className="label-mono text-accent transition-opacity hover:opacity-75"
            >
              {product.category_name}
            </Link>
          )}

          <h1 className="display-l mt-4">{product.name}</h1>

          {product.summary && (
            <p className="mt-4 text-lg leading-relaxed text-muted">
              {product.summary}
            </p>
          )}

          <div className="mt-7 flex items-baseline gap-3">
            <span className="price-mono text-3xl text-ink">
              {formatMoney(product.price_cents, settings.currency)}
            </span>
            {onOffer && (
              <span className="price-mono text-base text-muted line-through">
                {formatMoney(product.compare_cents as number, settings.currency)}
              </span>
            )}
          </div>

          <div className="mt-8">
            <AddToCart
              slug={product.slug}
              stock={product.stock}
              name={product.name}
            />
          </div>

          <dl className="mt-10 divide-y divide-hairline border-y border-hairline text-sm">
            <div className="flex justify-between gap-6 py-3.5">
              <dt className="text-muted">Delivery</dt>
              <dd className="text-right text-ink">
                {formatMoney(settings.delivery_fee_cents, settings.currency)}{" "}
                across Beirut
                {settings.free_delivery_over_cents > 0 && (
                  <>
                    , free over{" "}
                    {formatMoney(
                      settings.free_delivery_over_cents,
                      settings.currency,
                    )}
                  </>
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-6 py-3.5">
              <dt className="text-muted">Payment</dt>
              <dd className="text-right text-ink">
                {[
                  settings.cod_enabled ? "Cash on delivery" : null,
                  settings.transfer_enabled ? "transfer" : null,
                ]
                  .filter(Boolean)
                  .join(" or ") || "Ask the shop"}
              </dd>
            </div>
            <div className="flex justify-between gap-6 py-3.5">
              <dt className="text-muted">Returns</dt>
              <dd className="text-right text-ink">Seven days, unused</dd>
            </div>
          </dl>

          {product.description && (
            <div className="mt-8">
              <h2 className="label-mono text-muted">Details</h2>
              <p className="mt-3 leading-relaxed whitespace-pre-line text-ink/85">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="display-m">
            More from {product.category_name?.toLowerCase()}
          </h2>
          <div className="hairline-grid mt-8 grid sm:grid-cols-2 lg:grid-cols-3">
            {related.map((entry) => (
              <ProductCard
                key={entry.id}
                product={entry}
                currency={settings.currency}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
