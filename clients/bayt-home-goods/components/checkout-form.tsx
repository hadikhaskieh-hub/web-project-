"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { clearCart, useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import { ArrowRight, Spinner } from "./icons";
import { usePricedCart } from "./use-priced-cart";

type Errors = Record<string, string>;
type Method = "cod" | "transfer";

const BLANK = {
  customer_name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  notes: "",
  transfer_ref: "",
};

export function CheckoutForm() {
  const router = useRouter();
  const { lines } = useCart();
  const { price, ready, empty, failed } = usePricedCart();

  const [values, setValues] = useState(BLANK);
  const [method, setMethod] = useState<Method>("cod");
  const [errors, setErrors] = useState<Errors>({});
  const [problem, setProblem] = useState("");
  const [sending, setSending] = useState(false);
  const methodPicked = useRef(false);

  // Follow whatever the shop currently accepts, until the customer chooses.
  useEffect(() => {
    if (!price || methodPicked.current) return;
    if (!price.cod_enabled && price.transfer_enabled) setMethod("transfer");
    if (price.cod_enabled && !price.transfer_enabled) setMethod("cod");
  }, [price]);

  if (!ready) return <CheckoutSkeleton />;

  if (failed) {
    return (
      <Notice
        title="Checkout could not load"
        body="The shop did not answer in time. Your basket is safe, so please reload the page and try again."
      />
    );
  }

  if (empty || !price || price.lines.length === 0) {
    return (
      <Notice
        title="There is nothing to order"
        body="Your basket is empty, so there is nothing to check out with yet."
        action={
          <Link href="/shop" className="btn-slab mt-7">
            Shop all
            <ArrowRight />
          </Link>
        }
      />
    );
  }

  const set = (field: keyof typeof BLANK) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  function validate(): Errors {
    const found: Errors = {};
    if (!values.customer_name.trim()) found.customer_name = "Tell us who to ask for.";
    if (!values.phone.trim())
      found.phone = "We need a phone number for the delivery.";
    else if (values.phone.replace(/\D/g, "").length < 7)
      found.phone = "That phone number looks too short.";
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
      found.email = "That email address looks off.";
    if (!values.address.trim()) found.address = "Add a street and building.";
    if (!values.city.trim()) found.city = "Add a city or area.";
    if (method === "transfer" && !values.transfer_ref.trim())
      found.transfer_ref = "Add the reference from your transfer receipt.";
    return found;
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    setProblem("");
    const found = validate();

    if (Object.keys(found).length > 0) {
      setErrors(found);
      const first = document.getElementById(Object.keys(found)[0]);
      first?.focus();
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: lines,
          ...values,
          payment_method: method,
        }),
      });

      const data = (await response.json()) as {
        code?: string;
        message?: string;
        errors?: Errors;
      };

      if (!response.ok || !data.code) {
        setErrors(data.errors ?? {});
        setProblem(data.message ?? "The order did not go through.");
        setSending(false);
        return;
      }

      clearCart();
      router.push(`/order/${data.code}`);
    } catch {
      setProblem(
        "The order did not reach the shop. Check your connection and try once more.",
      );
      setSending(false);
    }
  }

  const currency = price.currency;

  return (
    <form onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-7">
        <fieldset disabled={sending} className="space-y-6">
          <legend className="label-mono text-muted">Where it goes</legend>

          <Field
            id="customer_name"
            label="Full name"
            value={values.customer_name}
            onChange={set("customer_name")}
            error={errors.customer_name}
            autoComplete="name"
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              id="phone"
              label="Phone"
              type="tel"
              value={values.phone}
              onChange={set("phone")}
              error={errors.phone}
              autoComplete="tel"
              hint="The driver calls this number."
            />
            <Field
              id="email"
              label="Email"
              type="email"
              value={values.email}
              onChange={set("email")}
              error={errors.email}
              autoComplete="email"
              optional
            />
          </div>

          <Field
            id="address"
            label="Street and building"
            value={values.address}
            onChange={set("address")}
            error={errors.address}
            autoComplete="street-address"
            multiline
          />

          <Field
            id="city"
            label="City or area"
            value={values.city}
            onChange={set("city")}
            error={errors.city}
            autoComplete="address-level2"
          />

          <Field
            id="notes"
            label="Anything the driver should know"
            value={values.notes}
            onChange={set("notes")}
            error={errors.notes}
            optional
            multiline
            hint="Floor, entrance, best time to call."
          />
        </fieldset>

        <fieldset disabled={sending} className="mt-12">
          <legend className="label-mono text-muted">How you pay</legend>

          <div className="mt-5 space-y-3">
            {price.cod_enabled && (
              <PaymentChoice
                id="pay-cod"
                checked={method === "cod"}
                onSelect={() => {
                  methodPicked.current = true;
                  setMethod("cod");
                }}
                title="Cash on delivery"
                body="Pay the driver when the order reaches your door."
              />
            )}

            {price.transfer_enabled && (
              <PaymentChoice
                id="pay-transfer"
                checked={method === "transfer"}
                onSelect={() => {
                  methodPicked.current = true;
                  setMethod("transfer");
                }}
                title="Bank or mobile transfer"
                body={`Send the total to ${price.transfer_number}, then give us the reference.`}
              />
            )}

            {!price.cod_enabled && !price.transfer_enabled && (
              <p className="border border-hairline p-4 text-sm text-muted">
                No payment method is switched on right now. Please call the shop
                to place this order.
              </p>
            )}
          </div>

          {method === "transfer" && price.transfer_enabled && (
            <div className="mt-5 border-l-2 border-accent bg-surface p-5">
              <p className="text-sm leading-relaxed text-ink/85">
                Send{" "}
                <span className="price-mono text-ink">
                  {formatMoney(price.total_cents, currency)}
                </span>{" "}
                to{" "}
                <span className="price-mono text-ink">
                  {price.transfer_number}
                </span>
                , then copy the reference from your receipt into the box below.
                We check it before the order is packed.
              </p>

              <div className="mt-4">
                <Field
                  id="transfer_ref"
                  label="Transfer reference"
                  value={values.transfer_ref}
                  onChange={set("transfer_ref")}
                  error={errors.transfer_ref}
                  mono
                />
              </div>
            </div>
          )}

          {errors.payment_method && (
            <p className="mt-3 text-sm text-warn-ink">{errors.payment_method}</p>
          )}
        </fieldset>
      </div>

      {/* Summary sidebar */}
      <aside className="lg:col-span-5">
        <div className="bg-surface p-6 lg:sticky lg:top-24">
          <h2 className="label-mono text-muted">Your order</h2>

          <ul className="mt-5 space-y-3 border-b border-hairline pb-5 text-sm">
            {price.lines.map((line) => (
              <li key={line.slug} className="flex justify-between gap-4">
                <span className="min-w-0 text-ink/85">
                  {line.name}
                  <span className="price-mono text-muted"> x{line.qty}</span>
                </span>
                <span className="price-mono shrink-0 text-ink">
                  {formatMoney(line.line_cents, currency)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Subtotal</dt>
              <dd className="price-mono text-ink">
                {formatMoney(price.subtotal_cents, currency)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Delivery</dt>
              <dd className="price-mono text-ink">
                {price.delivery_cents === 0
                  ? "Free"
                  : formatMoney(price.delivery_cents, currency)}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-hairline pt-5">
            <span className="text-ink">Total</span>
            <span className="price-mono text-2xl text-ink">
              {formatMoney(price.total_cents, currency)}
            </span>
          </div>

          {problem && (
            <p
              role="alert"
              className="mt-5 border-l-2 border-warn bg-ground p-3 text-sm text-warn-ink"
            >
              {problem}
            </p>
          )}

          <div className="mt-6">
            <button type="submit" className="btn-bar" disabled={sending}>
              {sending ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Placing your order
                </>
              ) : (
                <>Place order</>
              )}
            </button>
          </div>

          <p className="mt-4 text-center text-sm text-muted">
            {method === "cod"
              ? "You pay the driver on delivery."
              : "We confirm your transfer before packing."}
          </p>

          <Link href="/cart" className="link-quiet mt-5 block text-center text-sm">
            Back to the basket
          </Link>
        </div>
      </aside>
    </form>
  );
}

/* ------------------------------------------------------------------ */

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  hint,
  optional = false,
  multiline = false,
  mono = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  hint?: string;
  optional?: boolean;
  multiline?: boolean;
  mono?: boolean;
}) {
  const describedBy =
    [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const shared = {
    id,
    name: id,
    value,
    autoComplete,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: `field-input ${mono ? "price-mono" : ""}`,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => onChange(event.target.value),
  };

  return (
    <div>
      {/* Label above the input, always. Never a placeholder standing in. */}
      <label htmlFor={id} className="mb-2 block text-sm text-ink">
        {label}
        {optional && <span className="text-muted"> (optional)</span>}
      </label>

      {multiline ? (
        <textarea {...shared} rows={3} className={`${shared.className} resize-y`} />
      ) : (
        <input {...shared} type={type} />
      )}

      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-warn-ink">
          {error}
        </p>
      )}
    </div>
  );
}

function PaymentChoice({
  id,
  checked,
  onSelect,
  title,
  body,
}: {
  id: string;
  checked: boolean;
  onSelect: () => void;
  title: string;
  body: string;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer gap-4 border p-4 transition-colors ${
        checked
          ? "border-accent bg-surface"
          : "border-hairline hover:border-muted/50"
      }`}
    >
      <input
        type="radio"
        id={id}
        name="payment_method"
        checked={checked}
        onChange={onSelect}
        className="mt-1 h-4 w-4 shrink-0 accent-accent"
      />
      <span>
        <span className="block text-ink">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-muted">
          {body}
        </span>
      </span>
    </label>
  );
}

function Notice({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-hairline bg-surface/40 px-6 py-14 text-center">
      <h2 className="display-m">{title}</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
        {body}
      </p>
      {action}
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14" aria-hidden="true">
      <div className="space-y-6 lg:col-span-7">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="space-y-2">
            <div className="skeleton h-3 w-28" />
            <div className="skeleton h-12 w-full" />
          </div>
        ))}
        <div className="skeleton h-24 w-full" />
      </div>
      <div className="lg:col-span-5">
        <div className="space-y-4 bg-surface p-6">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-4/5" />
          <div className="skeleton h-8 w-1/2" />
          <div className="skeleton h-14 w-full" />
        </div>
      </div>
    </div>
  );
}
