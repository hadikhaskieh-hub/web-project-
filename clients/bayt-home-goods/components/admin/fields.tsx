"use client";

/** Shared form pieces for the admin panel. Labels above, errors below. */

export function AdminField({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  hint,
  multiline = false,
  rows = 4,
  mono = false,
  autoComplete,
  inputMode,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  hint?: string;
  multiline?: boolean;
  rows?: number;
  mono?: boolean;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email";
  placeholder?: string;
}) {
  const describedBy =
    [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const shared = {
    id,
    name: id,
    value,
    placeholder,
    autoComplete,
    inputMode,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: `field-input ${mono ? "price-mono" : ""}`,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => onChange(event.target.value),
  };

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-ink">
        {label}
      </label>

      {multiline ? (
        <textarea {...shared} rows={rows} className={`${shared.className} resize-y`} />
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

export function AdminToggle({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 border border-hairline p-4 transition-colors hover:border-muted/40"
    >
      <input
        id={id}
        name={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
      />
      <span>
        <span className="block text-sm text-ink">{label}</span>
        {hint && (
          <span className="mt-1 block text-sm leading-relaxed text-muted">
            {hint}
          </span>
        )}
      </span>
    </label>
  );
}

export function AdminSelect({
  id,
  label,
  value,
  onChange,
  options,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-ink">
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        className="field-input cursor-pointer pr-10"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-sm text-warn-ink">{error}</p>}
    </div>
  );
}

export function FormMessage({
  tone,
  children,
}: {
  tone: "good" | "bad";
  children: React.ReactNode;
}) {
  return (
    <p
      role={tone === "bad" ? "alert" : "status"}
      className={`border-l-2 bg-ground p-3 text-sm ${
        tone === "bad"
          ? "border-warn text-warn-ink"
          : "border-accent text-ink"
      }`}
    >
      {children}
    </p>
  );
}
