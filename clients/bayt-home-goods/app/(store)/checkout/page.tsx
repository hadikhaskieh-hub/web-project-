import type { Metadata } from "next";

import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Leave your delivery details and choose how you want to pay.",
  robots: { index: false, follow: true },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="label-mono text-accent">Step two of two</p>
      <h1 className="display-l mt-4">Where should it go</h1>
      <p className="mt-4 max-w-xl leading-relaxed text-muted">
        Nothing is charged here. You pay the driver in cash, or by transfer
        before we pack the order.
      </p>

      <div className="mt-12">
        <CheckoutForm />
      </div>
    </div>
  );
}
