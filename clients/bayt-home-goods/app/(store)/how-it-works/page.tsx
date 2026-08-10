import type { Metadata } from "next";
import Link from "next/link";

import { ArrowRight } from "@/components/icons";
import { getSettings } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Ordering, cash on delivery, transfers, delivery fees and returns, in plain language.",
};

export default function HowItWorksPage() {
  const settings = getSettings();
  const fee = formatMoney(settings.delivery_fee_cents, settings.currency);
  const threshold = formatMoney(
    settings.free_delivery_over_cents,
    settings.currency,
  );

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="label-mono text-accent">Plain answers</p>
      <h1 className="display-l mt-4">How ordering works</h1>
      <p className="mt-5 text-lg leading-relaxed text-muted">
        No account, no card, no payment page. You leave an address, we call to
        confirm, and you pay when the order reaches you.
      </p>

      <Section title="Placing an order">
        <ol className="space-y-6">
          {[
            {
              head: "Add what you want to the basket",
              body: "The basket is stored in your own browser. Close the tab, come back tomorrow, and it is still there. Nothing is reserved until you place the order.",
            },
            {
              head: "Fill in the checkout form",
              body: "Name, phone, street and building, and the area you are in. Email is optional. If your building is hard to find, write it in the note box and the driver will read it.",
            },
            {
              head: "Choose how you want to pay",
              body: "Cash on delivery or a transfer. Both are explained below.",
            },
            {
              head: "We call you the same day",
              body: "Someone from the shop rings to confirm the order and agree a window. If we cannot reach you by phone we try again the next morning.",
            },
          ].map((step, index) => (
            <li key={step.head} className="flex gap-5">
              <span className="price-mono shrink-0 pt-1 text-sm text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-lg tracking-tight text-ink">{step.head}</h3>
                <p className="mt-1.5 leading-relaxed text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Paying">
        <div className="space-y-8">
          {settings.cod_enabled && (
            <div>
              <h3 className="display-m">Cash on delivery</h3>
              <p className="mt-3 leading-relaxed text-muted">
                The most common choice. You pay the driver at your door, in
                cash, once the order is in your hands. Nothing is charged
                online, and the shop never asks for card details, not on the
                site and not on the phone.
              </p>
              <p className="mt-3 leading-relaxed text-muted">
                Please have the amount ready. Drivers carry very little change.
              </p>
            </div>
          )}

          {settings.transfer_enabled && (
            <div>
              <h3 className="display-m">Bank or mobile transfer</h3>
              <p className="mt-3 leading-relaxed text-muted">
                Send the order total to{" "}
                <span className="price-mono text-ink">
                  {settings.transfer_number}
                </span>
                , then copy the reference number from your receipt into the last
                box at checkout. We match it against the transfer, and the order
                is packed once it clears.
              </p>
              <p className="mt-3 leading-relaxed text-muted">
                If the reference does not match anything on our side, we call
                you before doing anything else. We never cancel a paid order
                without speaking to you first.
              </p>
            </div>
          )}
        </div>
      </Section>

      <Section title="Delivery">
        <dl className="divide-y divide-hairline border-y border-hairline">
          <Row term="Inside Beirut" detail={fee} />
          {settings.free_delivery_over_cents > 0 && (
            <Row term={`Baskets over ${threshold}`} detail="Free" />
          )}
          <Row term="Outside Beirut" detail="Call the shop" />
          <Row term="Usual wait" detail="Next day" />
        </dl>
        <p className="mt-5 leading-relaxed text-muted">
          Orders placed before four in the afternoon usually go out the next
          day. Larger items such as lamps and tall baskets travel flat in the
          van, so we agree a window with you rather than leaving them with a
          neighbour.
        </p>
      </Section>

      <Section title="Returns">
        <p className="leading-relaxed text-muted">
          If something is not right, tell us within seven days and we collect it
          on the next delivery run in your area. The piece needs to be unused
          and in its packaging. Anything that arrives chipped or broken is
          replaced or refunded in full, and we do not ask you to pay the
          delivery fee twice.
        </p>
        <p className="mt-3 leading-relaxed text-muted">
          Send a photo to{" "}
          <a
            href={`mailto:${settings.store_email}`}
            className="link-quiet text-ink"
          >
            {settings.store_email}
          </a>{" "}
          or call{" "}
          <a
            href={`tel:${settings.store_phone.replace(/\s/g, "")}`}
            className="price-mono link-quiet text-ink"
          >
            {settings.store_phone}
          </a>
          .
        </p>
      </Section>

      <div className="mt-14 border-t border-hairline pt-10">
        <Link href="/shop" className="btn-slab">
          Shop all
          <ArrowRight />
        </Link>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <h2 className="label-mono mb-6 text-muted">{title}</h2>
      {children}
    </section>
  );
}

function Row({ term, detail }: { term: string; detail: string }) {
  return (
    <div className="flex justify-between gap-6 py-3.5">
      <dt className="text-ink/85">{term}</dt>
      <dd className="price-mono text-ink">{detail}</dd>
    </div>
  );
}
