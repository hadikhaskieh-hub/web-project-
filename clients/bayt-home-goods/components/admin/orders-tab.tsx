"use client";

import { useState } from "react";

import type { TabProps } from "@/lib/admin-data";
import {
  ORDER_STATUSES,
  STATUS_LABELS,
  type OrderStatus,
} from "@/lib/order-status";
import { formatMoney } from "@/lib/money";
import { FormMessage } from "./fields";

export function OrdersTab({ data, refresh }: TabProps) {
  const [saving, setSaving] = useState<string | null>(null);
  const [problem, setProblem] = useState("");
  const currency = data.settings.currency;

  async function changeStatus(code: string, status: OrderStatus) {
    setSaving(code);
    setProblem("");

    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, status }),
      });

      if (!response.ok) {
        const body = (await response.json()) as { message?: string };
        setProblem(body.message ?? "The status did not save.");
      } else {
        await refresh();
      }
    } catch {
      setProblem("The status did not save. Check your connection.");
    } finally {
      setSaving(null);
    }
  }

  if (data.orders.length === 0) {
    return (
      <div className="border border-hairline bg-surface/40 px-6 py-16 text-center">
        <h2 className="display-m">No orders yet</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
          Every order placed on the site lands here, newest first, with the
          phone number and address you need to deliver it.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="display-m">Orders</h1>
        <p className="label-mono text-muted">
          {data.orders.length} total
        </p>
      </div>

      {problem && (
        <div className="mt-5">
          <FormMessage tone="bad">{problem}</FormMessage>
        </div>
      )}

      <ul className="mt-7 space-y-4">
        {data.orders.map((order) => (
          <li key={order.id} className="border border-hairline bg-surface">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline p-5">
              <div>
                <p className="price-mono text-lg text-ink">{order.code}</p>
                <p className="mt-1 text-sm text-muted">
                  {new Date(`${order.created_at}Z`).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label htmlFor={`status-${order.code}`} className="sr-only">
                  Status for order {order.code}
                </label>
                <select
                  id={`status-${order.code}`}
                  value={order.status}
                  disabled={saving === order.code}
                  onChange={(event) =>
                    changeStatus(order.code, event.target.value as OrderStatus)
                  }
                  className="field-input min-h-11 w-48 cursor-pointer py-2 pr-10"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-6 p-5 sm:grid-cols-2">
              <div>
                <h3 className="label-mono text-muted">Customer</h3>
                <p className="mt-2.5 text-ink">{order.customer_name}</p>
                <p className="price-mono mt-1 text-sm">
                  <a
                    href={`tel:${order.phone.replace(/\s/g, "")}`}
                    className="text-ink transition-colors hover:text-accent"
                  >
                    {order.phone}
                  </a>
                </p>
                {order.email && (
                  <p className="mt-1 text-sm text-muted">{order.email}</p>
                )}
                <p className="mt-3 text-sm leading-relaxed text-ink/85">
                  {order.address}
                  <br />
                  {order.city}
                </p>
                {order.notes && (
                  <p className="mt-3 border-l-2 border-accent/50 pl-3 text-sm leading-relaxed text-muted">
                    {order.notes}
                  </p>
                )}
              </div>

              <div>
                <h3 className="label-mono text-muted">Items</h3>
                <ul className="mt-2.5 space-y-1.5 text-sm">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-4">
                      <span className="text-ink/85">
                        {item.name}
                        <span className="price-mono text-muted"> x{item.qty}</span>
                      </span>
                      <span className="price-mono shrink-0 text-ink">
                        {formatMoney(item.unit_cents * item.qty, currency)}
                      </span>
                    </li>
                  ))}
                </ul>

                <dl className="mt-4 space-y-1.5 border-t border-hairline pt-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Delivery</dt>
                    <dd className="price-mono text-ink">
                      {order.delivery_cents === 0
                        ? "Free"
                        : formatMoney(order.delivery_cents, currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink">Total</dt>
                    <dd className="price-mono text-lg text-ink">
                      {formatMoney(order.total_cents, currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 pt-1">
                    <dt className="text-muted">Paying by</dt>
                    <dd className="text-right text-ink">
                      {order.payment_method === "cod"
                        ? "Cash on delivery"
                        : "Transfer"}
                    </dd>
                  </div>
                  {order.payment_method === "transfer" && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted">Reference</dt>
                      <dd className="price-mono text-right text-ink">
                        {order.transfer_ref || "None given"}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
