import Link from "next/link";

import { ArrowRight } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <p className="label-mono text-accent">Nothing here</p>
      <h1 className="display-l mt-5">This page is not on any shelf</h1>
      <p className="mt-4 max-w-sm leading-relaxed text-muted">
        The link may be old, or the piece may have sold out and come off the
        site. The shop is still open.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-6">
        <Link href="/shop" className="btn-slab">
          Shop all
          <ArrowRight />
        </Link>
        <Link href="/" className="link-quiet text-sm">
          Back to the front page
        </Link>
      </div>
    </div>
  );
}
