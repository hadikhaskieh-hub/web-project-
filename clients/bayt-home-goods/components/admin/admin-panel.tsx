"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import type { AdminData } from "@/lib/admin-data";
import { OrdersTab } from "./orders-tab";
import { ProductsTab } from "./products-tab";
import { SettingsTab } from "./settings-tab";
import { TeamTab } from "./team-tab";

const TABS = ["Orders", "Products", "Settings", "Team"] as const;
type Tab = (typeof TABS)[number];

export function AdminPanel({ initial }: { initial: AdminData }) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [tab, setTab] = useState<Tab>("Orders");
  const [signingOut, setSigningOut] = useState(false);

  /** Pulls the whole panel state again after any change. */
  const refresh = useCallback(async () => {
    const response = await fetch("/api/admin/data");
    if (response.status === 401) {
      router.refresh();
      return;
    }
    if (!response.ok) return;
    setData((await response.json()) as AdminData);
  }, [router]);

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/admin/session", { method: "DELETE" });
    router.refresh();
  }

  const newOrders = data.orders.filter((order) => order.status === "new").length;

  return (
    <div className="min-h-dvh">
      <header className="border-b border-hairline">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-baseline gap-3">
            <span className="text-xl font-medium tracking-tighter">
              {data.settings.store_name}
            </span>
            <span className="label-mono text-accent">Admin</span>
          </div>

          <div className="flex items-center gap-5">
            <span className="hidden text-sm text-muted sm:inline">
              {data.me.name}
            </span>
            <Link href="/" className="link-quiet text-sm">
              View the shop
            </Link>
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="link-quiet text-sm"
            >
              {signingOut ? "Signing out" : "Sign out"}
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Admin sections">
            {TABS.map((name) => {
              const active = tab === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setTab(name)}
                  aria-current={active ? "page" : undefined}
                  className={`cursor-pointer border-b-2 px-4 py-3 text-sm whitespace-nowrap transition-colors ${
                    active
                      ? "border-accent text-ink"
                      : "border-transparent text-muted hover:text-ink"
                  }`}
                >
                  {name}
                  {name === "Orders" && newOrders > 0 && (
                    <span className="price-mono ml-2 bg-accent px-1.5 py-0.5 text-xs text-ground">
                      {newOrders}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        {tab === "Orders" && <OrdersTab data={data} refresh={refresh} />}
        {tab === "Products" && <ProductsTab data={data} refresh={refresh} />}
        {tab === "Settings" && <SettingsTab data={data} refresh={refresh} />}
        {tab === "Team" && <TeamTab data={data} refresh={refresh} />}
      </main>
    </div>
  );
}
