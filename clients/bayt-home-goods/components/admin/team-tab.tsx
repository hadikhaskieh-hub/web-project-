"use client";

import { useState } from "react";

import { Spinner } from "@/components/icons";
import type { TabProps } from "@/lib/admin-data";
import { AdminField, FormMessage } from "./fields";

export function TeamTab({ data, refresh }: TabProps) {
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState("");
  const [added, setAdded] = useState("");
  const [sending, setSending] = useState(false);

  const set = (field: keyof typeof values) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setAdded("");
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (sending) return;

    setSending(true);
    setProblem("");
    setAdded("");
    setErrors({});

    try {
      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });

      const body = (await response.json()) as {
        message?: string;
        errors?: Record<string, string>;
      };

      if (!response.ok) {
        setErrors(body.errors ?? {});
        setProblem(body.message ?? "The account was not created.");
        return;
      }

      await refresh();
      setAdded(`${values.name} can sign in now.`);
      setValues({ name: "", email: "", password: "" });
    } catch {
      setProblem("The account was not created. Check your connection.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <section className="lg:col-span-5">
        <h1 className="display-m">Team</h1>
        <p className="mt-3 leading-relaxed text-muted">
          Everyone here can see orders and edit products.
        </p>

        <ul className="mt-7 divide-y divide-hairline border-y border-hairline">
          {data.team.map((person) => (
            <li
              key={person.id}
              className="flex items-center justify-between gap-4 py-3.5"
            >
              <div className="min-w-0">
                <p className="truncate text-ink">{person.name}</p>
                <p className="truncate text-sm text-muted">{person.email}</p>
              </div>
              <span className="label-mono shrink-0 text-accent">
                {person.role}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="lg:col-span-7">
        <form
          onSubmit={submit}
          noValidate
          className="border border-hairline bg-surface p-6"
        >
          <h2 className="display-m">Add someone</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            They sign in at this same page with the email and password you set
            here. Tell them to change it with you present.
          </p>

          <fieldset disabled={sending} className="mt-7 space-y-6">
            <AdminField
              id="staff-name"
              label="Name"
              value={values.name}
              onChange={set("name")}
              error={errors.name}
            />
            <AdminField
              id="staff-email"
              label="Email"
              type="email"
              value={values.email}
              onChange={set("email")}
              error={errors.email}
            />
            <AdminField
              id="staff-password"
              label="Password"
              type="password"
              value={values.password}
              onChange={set("password")}
              error={errors.password}
              hint="Eight characters or more."
            />
          </fieldset>

          {problem && (
            <div className="mt-6">
              <FormMessage tone="bad">{problem}</FormMessage>
            </div>
          )}
          {added && !problem && (
            <div className="mt-6">
              <FormMessage tone="good">{added}</FormMessage>
            </div>
          )}

          <div className="mt-7">
            <button type="submit" className="btn-bar" disabled={sending}>
              {sending ? (
                <>
                  <Spinner />
                  Creating the account
                </>
              ) : (
                "Add to the team"
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
