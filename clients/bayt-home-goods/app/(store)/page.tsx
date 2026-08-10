import Link from "next/link";

import { HeroRoom } from "@/components/hero-room";
import { ArrowRight, Banknote, Truck } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import {
  countActiveProductsByCategory,
  getSettings,
  listCategories,
  listProducts,
} from "@/lib/db";
import { formatMoney } from "@/lib/money";

const STEPS = [
  {
    title: "Fill your basket",
    body: "Add what you want. The basket stays put if you close the tab and come back later.",
  },
  {
    title: "Leave your address",
    body: "Name, phone, street and area. Add a note if the building is hard to find.",
  },
  {
    title: "We call to confirm",
    body: "Someone from the shop rings you the same day to agree a delivery window.",
  },
  {
    title: "Pay at the door",
    body: "Cash to the driver, or send a transfer first and give us the reference.",
  },
];

export default function HomePage() {
  const settings = getSettings();
  const featured = listProducts({ featuredOnly: true, limit: 4 });
  const categories = listCategories();
  const counts = countActiveProductsByCategory();

  return (
    <>
      {/* 1. Hero, asymmetric split. The room lights up as you scroll. */}
      <section className="border-b border-hairline">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch lg:grid-cols-12">
          <div className="order-2 flex flex-col justify-center px-5 py-12 sm:px-8 lg:order-1 lg:col-span-5 lg:py-24 lg:pr-10">
            <p className="label-mono text-accent">Mar Mikhael, Beirut</p>

            <h1 className="display-xl mt-5 text-ink">
              Things you use
              <br />
              every day
            </h1>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              Ceramics, linen, lamps and baskets, chosen for small apartments.
              We deliver across Beirut and you pay when it arrives.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Link href="/shop" className="btn-slab">
                Shop all
                <ArrowRight />
              </Link>
              <Link href="/how-it-works" className="link-quiet text-sm">
                How ordering works
              </Link>
            </div>

            <p className="label-mono mt-9 text-muted">
              Delivery {formatMoney(settings.delivery_fee_cents, settings.currency)}
              {settings.free_delivery_over_cents > 0 && (
                <>
                  {" / "}free over{" "}
                  {formatMoney(settings.free_delivery_over_cents, settings.currency)}
                </>
              )}
            </p>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-7">
            <HeroRoom />
          </div>
        </div>
      </section>

      {/* 2. Card grid. The only grid of cards on this page. */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-mono text-accent">On the front shelf</p>
            <h2 className="display-l mt-4">Picked for this week</h2>
          </div>
          <Link href="/shop" className="link-quiet text-sm">
            See everything in the shop
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="hairline-grid mt-10 grid sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={settings.currency}
                priority={index < 2}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 border border-hairline p-10 text-center">
            <p className="text-muted">
              Nothing is marked for the front shelf yet.
            </p>
            <Link href="/shop" className="link-quiet mt-3 inline-block text-sm">
              Browse the whole shop
            </Link>
          </div>
        )}
      </section>

      {/* 3. Horizontal rail. */}
      <section className="border-y border-hairline bg-surface/40 py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="display-m">Four shelves</h2>
        </div>

        {/* The negative margin lets the rail run to the screen edge while its
            first tile still lines up with the heading above it. */}
        <div className="mx-auto mt-8 max-w-6xl overflow-x-auto px-5 pb-2 sm:px-8">
          <ul className="hairline-grid flex w-max snap-x">
            {categories.map((category) => (
              <li
                key={category.id}
                className="w-[16rem] snap-start sm:w-[16.5rem]"
              >
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="group flex h-full flex-col justify-between bg-ground p-6 transition-colors hover:bg-surface"
                >
                  <div>
                    <span className="label-mono text-accent">
                      {counts[category.id] ?? 0} items
                    </span>
                    <p className="display-m mt-4 text-ink">{category.name}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {category.blurb}
                    </p>
                  </div>
                  <span className="mt-8 inline-flex items-center gap-2 text-sm text-ink">
                    Open shelf
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4. Numbered row. Numbered because it genuinely is a sequence. */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <h2 className="display-l max-w-lg">Ordering takes four steps</h2>

        <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="border-t border-hairline pt-5">
              <span className="price-mono text-sm text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-lg tracking-tight text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* 5. Full bleed plate. */}
      <section className="bg-accent-deep">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div>
            <Truck className="h-6 w-6 text-accent" />
            <h2 className="display-m mt-5">Delivery across Beirut</h2>
            <p className="mt-4 max-w-md leading-relaxed text-ink/80">
              Orders placed before four in the afternoon usually arrive the next
              day. Anywhere inside the city is{" "}
              {formatMoney(settings.delivery_fee_cents, settings.currency)}
              {settings.free_delivery_over_cents > 0 && (
                <>
                  , and delivery is free once your basket passes{" "}
                  {formatMoney(
                    settings.free_delivery_over_cents,
                    settings.currency,
                  )}
                </>
              )}
              . For areas outside Beirut, call the shop and we will arrange it.
            </p>
          </div>

          <div>
            <Banknote className="h-6 w-6 text-accent" />
            <h2 className="display-m mt-5">Two ways to pay</h2>
            <dl className="mt-4 space-y-4 text-ink/80">
              {settings.cod_enabled && (
                <div className="border-l border-accent/40 pl-4">
                  <dt className="text-ink">Cash on delivery</dt>
                  <dd className="mt-1 text-sm leading-relaxed">
                    Hand the exact amount to the driver. Nothing is charged
                    online and no card details are taken.
                  </dd>
                </div>
              )}
              {settings.transfer_enabled && (
                <div className="border-l border-accent/40 pl-4">
                  <dt className="text-ink">Transfer</dt>
                  <dd className="mt-1 text-sm leading-relaxed">
                    Send the total to{" "}
                    <span className="price-mono text-ink">
                      {settings.transfer_number}
                    </span>{" "}
                    and put the receipt reference in the last box at checkout.
                    We confirm it before packing.
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
