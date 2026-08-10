"use client";

import { useState } from "react";

import { Spinner } from "@/components/icons";
import type { TabProps } from "@/lib/admin-data";
import { centsToInput } from "@/lib/money";
import { AdminField, AdminToggle, FormMessage } from "./fields";

export function SettingsTab({ data, refresh }: TabProps) {
  const [values, setValues] = useState({
    store_name: data.settings.store_name,
    transfer_number: data.settings.transfer_number,
    store_phone: data.settings.store_phone,
    store_email: data.settings.store_email,
    delivery_fee: centsToInput(data.settings.delivery_fee_cents),
    free_delivery_over: centsToInput(data.settings.free_delivery_over_cents),
    cod_enabled: data.settings.cod_enabled,
    transfer_enabled: data.settings.transfer_enabled,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState("");
  const [saved, setSaved] = useState(false);
  const [sending, setSending] = useState(false);

  const set = (field: keyof typeof values) => (value: string | boolean) => {
    setValues((current) => ({ ...current, [field]: value }));
    setSaved(false);
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field as string];
      return next;
    });
  };

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (sending) return;

    setSending(true);
    setProblem("");
    setSaved(false);
    setErrors({});

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });

      const body = (await response.json()) as {
        message?: string;
        errors?: Record<string, string>;
      };

      if (!response.ok) {
        setErrors(body.errors ?? {});
        setProblem(body.message ?? "The settings did not save.");
        return;
      }

      await refresh();
      setSaved(true);
    } catch {
      setProblem("The settings did not save. Check your connection.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={save} noValidate className="max-w-2xl">
      <h1 className="display-m">Settings</h1>
      <p className="mt-3 leading-relaxed text-muted">
        These values appear across the site, on every product page and in the
        checkout totals.
      </p>

      <fieldset disabled={sending} className="mt-9 space-y-8">
        <div className="space-y-6">
          <h2 className="label-mono text-muted">The shop</h2>
          <AdminField
            id="store_name"
            label="Shop name"
            value={values.store_name}
            onChange={set("store_name")}
            error={errors.store_name}
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <AdminField
              id="store_phone"
              label="Contact phone"
              value={values.store_phone}
              onChange={set("store_phone")}
              error={errors.store_phone}
              mono
              inputMode="tel"
            />
            <AdminField
              id="store_email"
              label="Contact email"
              type="email"
              value={values.store_email}
              onChange={set("store_email")}
              error={errors.store_email}
              inputMode="email"
            />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="label-mono text-muted">Delivery</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <AdminField
              id="delivery_fee"
              label={`Delivery fee (${data.settings.currency})`}
              value={values.delivery_fee}
              onChange={set("delivery_fee")}
              error={errors.delivery_fee}
              mono
              inputMode="decimal"
            />
            <AdminField
              id="free_delivery_over"
              label="Free delivery over"
              value={values.free_delivery_over}
              onChange={set("free_delivery_over")}
              error={errors.free_delivery_over}
              mono
              inputMode="decimal"
              hint="Set to 0.00 to always charge the fee."
            />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="label-mono text-muted">Payment</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminToggle
              id="cod_enabled"
              label="Cash on delivery"
              hint="Customers pay the driver."
              checked={values.cod_enabled}
              onChange={set("cod_enabled")}
            />
            <AdminToggle
              id="transfer_enabled"
              label="Bank or mobile transfer"
              hint="Customers send the total and give a reference."
              checked={values.transfer_enabled}
              onChange={set("transfer_enabled")}
            />
          </div>

          <AdminField
            id="transfer_number"
            label="Transfer number"
            value={values.transfer_number}
            onChange={set("transfer_number")}
            error={errors.transfer_number}
            mono
            hint="Shown at checkout and on the order confirmation."
          />

          {!values.cod_enabled && !values.transfer_enabled && (
            <FormMessage tone="bad">
              With both switched off nobody can place an order. Turn at least
              one back on.
            </FormMessage>
          )}
        </div>
      </fieldset>

      {problem && (
        <div className="mt-7">
          <FormMessage tone="bad">{problem}</FormMessage>
        </div>
      )}
      {saved && !problem && (
        <div className="mt-7">
          <FormMessage tone="good">Settings saved.</FormMessage>
        </div>
      )}

      <div className="mt-8">
        <button type="submit" className="btn-bar" disabled={sending}>
          {sending ? (
            <>
              <Spinner />
              Saving
            </>
          ) : (
            "Save settings"
          )}
        </button>
      </div>
    </form>
  );
}
