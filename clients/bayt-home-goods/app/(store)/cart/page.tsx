import type { Metadata } from "next";

import { CartView } from "@/components/cart-view";

export const metadata: Metadata = {
  title: "Your basket",
  description: "Review what you are ordering before you check out.",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="label-mono text-accent">Step one of two</p>
      <h1 className="display-l mt-4 mb-10">Your basket</h1>
      <CartView />
    </div>
  );
}
