import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowRight, Check } from "@/components/icons";
import { getOrderByCode, getSettings } from "@/lib/db";
import {
  ORDER_STATUSES,
  STATUS_LABELS,
  type OrderStatus,
} from "@/lib/order-status";
import { formatMoney } from "@/lib/money";

type Params = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Order ${code.toUpperCase()}`,
    description: "Your order and what happens next.",
    robots: { index: false, follow: false },
  };
}

/** The steps a normal order walks through. Cancelled sits outside them. */
const TRACK: OrderStatus[] = ORDER_STATUSES.filter(
  (status) => status !== "cancelled",
);

export default async function OrderPage({ params }: Params) {
  const { code } = await params;
  const order = getOrderByCode(code);

  if (!order) notFound();

  const settings = getSettings();
  const cancelled = order.status === "cancelled";
  const reached = TRACK.indexOf(order.status);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-ground">
          <Check className="h-5 w-5" />
        </span>
        <p className="label-mono text-accent">Order received</p>
      </div>

      <h1 className="display-l mt-6">
        Thank you, {order.customer_name.split(" ")[0]}
      </h1>

      <p className="mt-4 max-w-xl leading-relaxed text-muted">
        Someone from the shop calls{" "}
        <span className="price-mono text-ink">{order.phone}</span> today to
        agree a delivery window. Keep this code, it is how we find your order.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-hairline py-5">
        <div>
          <p className="label-mono text-muted">Order code</p>
          <p className="price-mono mt-1.5 text-2xl tracking-tight text-ink">
            {order.code}
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="label-mono text-muted">Total</p>
          <p className="price-mono mt-1.5 text-2xl text-ink">
            {formatMoney(order.total_cents, settings.currency)}
          </p>
        </div>
      </div>

      {/* Status */}
      <section className="mt-10">
        <h2 className="label-mono text-muted">Where it is</h2>

        {cancelled ? (
          <p className="mt-4 border-l-2 border-warn bg-surface p-4 text-ink">
            This order was cancelled. Call the shop if that looks wrong.
          </p>
        ) : (
          <ol className="mt-5 grid gap-3 sm:grid-cols-5">
            {TRACK.map((status, index) => {
              const done = index <= reached;
              return (
                <li key={status} className="flex items-center gap-3 sm:block">
                  <span
                    aria-hidden="true"
                    className={`block h-0.5 w-6 sm:w-full ${
                      done ? "bg-accent" : "bg-hairline"
                    }`}
                  />
                  <span
                    className={`mt-3 block text-sm ${
                      done ? "text-ink" : "text-muted"
                    }`}
                  >
                    {STATUS_LABELS[status]}
                    {index === reached && (
                      <span className="sr-only"> (current)</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* What to pay */}
      <section className="mt-12 bg-surface p-6">
        <h2 className="label-mono text-muted">What to pay</h2>

        {order.payment_method === "cod" ? (
          <>
            <p className="mt-4 text-lg leading-relaxed text-ink">
              Hand{" "}
              <span className="price-mono">
                {formatMoney(order.total_cents, settings.currency)}
              </span>{" "}
              to the driver when the order arrives.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Nothing has been charged and no card details were taken. Please
              have the amount ready, drivers rarely carry change.
            </p>
          </>
        ) : (
          <>
            <p className="mt-4 text-lg leading-relaxed text-ink">
              Transfer{" "}
              <span className="price-mono">
                {formatMoney(order.total_cents, settings.currency)}
              </span>{" "}
              to{" "}
              <span className="price-mono">{settings.transfer_number}</span>.
            </p>
            <dl className="mt-4 text-sm">
              <dt className="text-muted">Reference you gave us</dt>
              <dd className="price-mono mt-1 text-ink">
                {order.transfer_ref || "None yet"}
              </dd>
            </dl>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              We match the reference against the transfer, then pack the order.
              If it does not arrive within a day we call you.
            </p>
          </>
        )}
      </section>

      {/* Items */}
      <section className="mt-10">
        <h2 className="label-mono text-muted">What you ordered</h2>

        <ul className="mt-4 divide-y divide-hairline border-y border-hairline">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3.5">
              <span className="text-ink/85">
                {item.name}
                <span className="price-mono text-muted"> x{item.qty}</span>
              </span>
              <span className="price-mono shrink-0 text-ink">
                {formatMoney(item.unit_cents * item.qty, settings.currency)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-2.5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Subtotal</dt>
            <dd className="price-mono text-ink">
              {formatMoney(order.subtotal_cents, settings.currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Delivery</dt>
            <dd className="price-mono text-ink">
              {order.delivery_cents === 0
                ? "Free"
                : formatMoney(order.delivery_cents, settings.currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-hairline pt-3">
            <dt className="text-ink">Total</dt>
            <dd className="price-mono text-lg text-ink">
              {formatMoney(order.total_cents, settings.currency)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Delivery address */}
      <section className="mt-10">
        <h2 className="label-mono text-muted">Going to</h2>
        <address className="mt-3 not-italic leading-relaxed text-ink/85">
          {order.customer_name}
          <br />
          {order.address}
          <br />
          {order.city}
          <br />
          <span className="price-mono">{order.phone}</span>
        </address>
        {order.notes && (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Note for the driver: {order.notes}
          </p>
        )}
      </section>

      <div className="mt-12 flex flex-wrap items-center gap-6 border-t border-hairline pt-8">
        <Link href="/shop" className="btn-slab">
          Shop all
          <ArrowRight />
        </Link>
        <a
          href={`tel:${settings.store_phone.replace(/\s/g, "")}`}
          className="link-quiet text-sm"
        >
          Call the shop on {settings.store_phone}
        </a>
      </div>
    </div>
  );
}
