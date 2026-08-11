"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Plus, Spinner } from "@/components/icons";
import type { TabProps } from "@/lib/admin-data";
import type { ProductWithCategory } from "@/lib/db";
import { centsToInput, formatMoney } from "@/lib/money";
import { ProductPhoto } from "@/components/product-photo";
import { AdminField, AdminSelect, AdminToggle, FormMessage } from "./fields";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

type Draft = {
  id: number;
  name: string;
  summary: string;
  description: string;
  price: string;
  compare: string;
  stock: string;
  category_id: string;
  featured: boolean;
  active: boolean;
  image_path: string | null;
};

const NEW_DRAFT: Draft = {
  id: 0,
  name: "",
  summary: "",
  description: "",
  price: "",
  compare: "",
  stock: "0",
  category_id: "0",
  featured: false,
  active: true,
  image_path: null,
};

function toDraft(product: ProductWithCategory): Draft {
  return {
    id: product.id,
    name: product.name,
    summary: product.summary,
    description: product.description,
    price: centsToInput(product.price_cents),
    compare: product.compare_cents ? centsToInput(product.compare_cents) : "",
    stock: String(product.stock),
    category_id: String(product.category_id ?? 0),
    featured: product.featured === 1,
    active: product.active === 1,
    image_path: product.image_path,
  };
}

export function ProductsTab({ data, refresh }: TabProps) {
  const [draft, setDraft] = useState<Draft>(NEW_DRAFT);
  // Bumped on every selection so the editor remounts with clean state, even
  // when the same row is picked twice.
  const [seq, setSeq] = useState(0);
  const currency = data.settings.currency;

  const choose = (next: Draft) => {
    setDraft(next);
    setSeq((n) => n + 1);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <section className="lg:col-span-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="display-m">Products</h1>
          <button
            type="button"
            onClick={() => choose(NEW_DRAFT)}
            className="link-quiet inline-flex items-center gap-1.5 text-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            New product
          </button>
        </div>

        <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
          {data.products.map((product) => {
            const selected = draft.id === product.id;
            return (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => choose(toDraft(product))}
                  aria-current={selected ? "true" : undefined}
                  className={`flex w-full cursor-pointer items-center gap-4 py-3 pr-2 pl-2 text-left transition-colors ${
                    selected ? "bg-surface" : "hover:bg-surface/60"
                  }`}
                >
                  <Thumb product={product} />

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-ink">
                      {product.name}
                    </span>
                    <span className="label-mono mt-1 block text-muted">
                      {product.active === 0 && "Hidden / "}
                      {product.featured === 1 && "Home / "}
                      {product.stock} in stock
                    </span>
                  </span>

                  <span className="price-mono shrink-0 text-sm text-ink">
                    {formatMoney(product.price_cents, currency)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {data.products.length === 0 && (
          <p className="mt-6 text-sm text-muted">
            No products yet. Fill in the panel to add the first one.
          </p>
        )}
      </section>

      <section className="lg:col-span-7">
        <ProductEditor
          key={`${draft.id}-${seq}`}
          draft={draft}
          onDone={choose}
          data={data}
          refresh={refresh}
        />
      </section>
    </div>
  );
}

function Thumb({ product }: { product: ProductWithCategory }) {
  if (product.image_path) {
    return (
      <span className="relative block h-12 w-12 shrink-0 overflow-hidden bg-surface">
        <Image
          src={product.image_path}
          alt=""
          fill
          sizes="48px"
          className="object-cover"
        />
      </span>
    );
  }

  return (
    <ProductPhoto
      name={product.name}
      imagePath={null}
      slug={product.slug}
      categorySlug={product.category_slug}
      showLabel={false}
      className="h-12 w-12 shrink-0"
    />
  );
}

function ProductEditor({
  draft,
  onDone,
  data,
  refresh,
}: {
  draft: Draft;
  onDone: (draft: Draft) => void;
  data: TabProps["data"];
  refresh: TabProps["refresh"];
}) {
  const [values, setValues] = useState(draft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState("");
  const [saved, setSaved] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const set = (field: keyof Draft) => (value: string | boolean) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field as string];
      return next;
    });
  };

  const shownPhoto = removePhoto ? null : (preview ?? values.image_path);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (sending) return;

    setSending(true);
    setProblem("");
    setSaved("");
    setErrors({});

    const form = new FormData();
    form.set("id", String(values.id));
    form.set("name", values.name);
    form.set("summary", values.summary);
    form.set("description", values.description);
    form.set("price", values.price);
    form.set("compare", values.compare);
    form.set("stock", values.stock);
    form.set("category_id", values.category_id);
    form.set("featured", values.featured ? "1" : "0");
    form.set("active", values.active ? "1" : "0");
    if (removePhoto) form.set("remove_photo", "1");
    if (file) form.set("photo", file);

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: form,
      });

      const body = (await response.json()) as {
        ok?: boolean;
        id?: number;
        message?: string;
        errors?: Record<string, string>;
      };

      if (!response.ok) {
        setErrors(body.errors ?? {});
        setProblem(body.message ?? "The product did not save.");
        setSending(false);
        return;
      }

      await refresh();
      setFile(null);
      setRemovePhoto(false);
      if (fileInput.current) fileInput.current.value = "";
      setSaved(values.id > 0 ? "Saved." : "Added to the shop.");

      if (values.id === 0 && body.id) {
        setValues((current) => ({ ...current, id: body.id as number }));
      }
    } catch {
      setProblem("The product did not save. Check your connection.");
    } finally {
      setSending(false);
    }
  }

  async function remove() {
    setSending(true);
    setProblem("");

    try {
      const response = await fetch(`/api/admin/products?id=${values.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const body = (await response.json()) as { message?: string };
        setProblem(body.message ?? "That did not delete.");
        setSending(false);
        return;
      }

      await refresh();
      onDone(NEW_DRAFT);
    } catch {
      setProblem("That did not delete. Check your connection.");
      setSending(false);
    }
  }

  const categoryOptions = [
    { value: "0", label: "No shelf" },
    ...data.categories.map((category) => ({
      value: String(category.id),
      label: category.name,
    })),
  ];

  return (
    <form onSubmit={save} noValidate className="border border-hairline bg-surface p-6">
      <h2 className="display-m">
        {values.id > 0 ? "Edit product" : "New product"}
      </h2>

      <fieldset disabled={sending} className="mt-7 space-y-6">
        <AdminField
          id="product-name"
          label="Name"
          value={values.name}
          onChange={set("name")}
          error={errors.name}
        />

        <AdminField
          id="product-summary"
          label="Short line"
          value={values.summary}
          onChange={set("summary")}
          error={errors.summary}
          hint="One line under the name. Size, material, where it is from."
        />

        <AdminField
          id="product-description"
          label="Description"
          value={values.description}
          onChange={set("description")}
          error={errors.description}
          multiline
          rows={6}
        />

        <div className="grid gap-6 sm:grid-cols-3">
          <AdminField
            id="product-price"
            label={`Price (${data.settings.currency})`}
            value={values.price}
            onChange={set("price")}
            error={errors.price}
            mono
            inputMode="decimal"
            placeholder="24.50"
          />
          <AdminField
            id="product-compare"
            label="Old price"
            value={values.compare}
            onChange={set("compare")}
            error={errors.compare}
            mono
            inputMode="decimal"
            placeholder="Blank"
          />
          <AdminField
            id="product-stock"
            label="Stock"
            value={values.stock}
            onChange={set("stock")}
            error={errors.stock}
            mono
            inputMode="numeric"
          />
        </div>

        <AdminSelect
          id="product-category"
          label="Shelf"
          value={values.category_id}
          onChange={set("category_id")}
          options={categoryOptions}
          error={errors.category_id}
        />

        {/* Photo */}
        <div>
          <p className="mb-2 block text-sm text-ink">Photo</p>

          <div className="flex flex-wrap items-start gap-5">
            <div className="h-28 w-28 shrink-0 overflow-hidden">
              {shownPhoto ? (
                // A blob preview is not a Next image source, so this stays
                // a plain img tag on purpose.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={shownPhoto}
                  alt="Photo preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="photo-soon h-full w-full">
                  <span className="price-mono relative z-10 text-2xl text-accent/70">
                    {values.name.trim().charAt(0).toUpperCase() || "B"}
                  </span>
                </span>
              )}
            </div>

            <div className="flex-1">
              <label
                htmlFor="product-photo"
                className="btn-wipe inline-flex cursor-pointer"
              >
                <span>{shownPhoto ? "Replace photo" : "Choose photo"}</span>
              </label>
              <input
                ref={fileInput}
                id="product-photo"
                name="photo"
                type="file"
                accept={ACCEPT}
                className="sr-only"
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                  setRemovePhoto(false);
                }}
              />

              <p className="mt-3 text-sm leading-relaxed text-muted">
                JPG, PNG, WEBP or AVIF, up to 6 MB. A tall photo on a plain
                background sits best in the grid.
              </p>

              {shownPhoto && (
                <button
                  type="button"
                  className="link-quiet mt-3 text-sm"
                  onClick={() => {
                    setFile(null);
                    setRemovePhoto(true);
                    if (fileInput.current) fileInput.current.value = "";
                  }}
                >
                  Remove the photo
                </button>
              )}

              {errors.photo && (
                <p className="mt-3 text-sm text-warn-ink">{errors.photo}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AdminToggle
            id="product-featured"
            label="Show on the home page"
            hint="Adds it to the front shelf block."
            checked={values.featured}
            onChange={set("featured")}
          />
          <AdminToggle
            id="product-active"
            label="Visible in the shop"
            hint="Turn off to hide it without deleting it."
            checked={values.active}
            onChange={set("active")}
          />
        </div>
      </fieldset>

      {problem && (
        <div className="mt-6">
          <FormMessage tone="bad">{problem}</FormMessage>
        </div>
      )}
      {saved && !problem && (
        <div className="mt-6">
          <FormMessage tone="good">{saved}</FormMessage>
        </div>
      )}

      <div className="mt-7">
        <button type="submit" className="btn-bar" disabled={sending}>
          {sending ? (
            <>
              <Spinner />
              Saving
            </>
          ) : values.id > 0 ? (
            "Save changes"
          ) : (
            "Add to the shop"
          )}
        </button>
      </div>

      {values.id > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-hairline pt-5">
          {confirmDelete ? (
            <>
              <p className="text-sm text-ink">
                Delete {values.name}? Past orders keep their own copy.
              </p>
              <button
                type="button"
                onClick={remove}
                disabled={sending}
                className="link-quiet text-sm text-warn-ink"
              >
                Yes, delete it
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="link-quiet text-sm"
              >
                Keep it
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="link-quiet text-sm"
            >
              Delete this product
            </button>
          )}
        </div>
      )}
    </form>
  );
}
