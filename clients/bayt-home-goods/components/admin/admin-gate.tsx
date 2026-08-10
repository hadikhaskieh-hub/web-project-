"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Spinner } from "@/components/icons";
import { AdminField, FormMessage } from "./fields";

type Errors = Record<string, string>;

/**
 * The door. While the shop has no accounts it offers to create the owner.
 * After that it only ever offers a sign in.
 */
export function AdminGate({ firstRun }: { firstRun: boolean }) {
  return firstRun ? <SetupForm /> : <LoginForm />;
}

function Shell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-16">
      <p className="label-mono text-accent">{eyebrow}</p>
      <h1 className="display-l mt-4">{title}</h1>
      <p className="mt-4 leading-relaxed text-muted">{intro}</p>
      <div className="mt-9">{children}</div>
    </div>
  );
}

function SetupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [problem, setProblem] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (sending) return;

    setSending(true);
    setProblem("");
    setErrors({});

    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = (await response.json()) as {
        message?: string;
        errors?: Errors;
      };

      if (!response.ok) {
        setErrors(data.errors ?? {});
        setProblem(data.message ?? "The account could not be created.");
        setSending(false);
        return;
      }

      router.refresh();
    } catch {
      setProblem("The shop did not answer. Check your connection.");
      setSending(false);
    }
  }

  return (
    <Shell
      eyebrow="First run"
      title="Create the owner account"
      intro="This shop has no accounts yet. The first one you make is the owner. Once it exists, this form is replaced by a sign in."
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <fieldset disabled={sending} className="space-y-5">
          <AdminField
            id="name"
            label="Your name"
            value={name}
            onChange={setName}
            error={errors.name}
            autoComplete="name"
          />
          <AdminField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            error={errors.email}
            autoComplete="email"
          />
          <AdminField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            hint="Eight characters or more."
            autoComplete="new-password"
          />
        </fieldset>

        {problem && <FormMessage tone="bad">{problem}</FormMessage>}

        <button type="submit" className="btn-bar" disabled={sending}>
          {sending ? (
            <>
              <Spinner />
              Creating the account
            </>
          ) : (
            "Create the owner account"
          )}
        </button>
      </form>
    </Shell>
  );
}

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [problem, setProblem] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (sending) return;

    setSending(true);
    setProblem("");

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        setProblem(data.message ?? "That did not work.");
        setSending(false);
        return;
      }

      router.refresh();
    } catch {
      setProblem("The shop did not answer. Check your connection.");
      setSending(false);
    }
  }

  return (
    <Shell
      eyebrow="Staff only"
      title="Sign in"
      intro="Orders, products and settings live behind this door."
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <fieldset disabled={sending} className="space-y-5">
          <AdminField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="username"
          />
          <AdminField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
        </fieldset>

        {problem && <FormMessage tone="bad">{problem}</FormMessage>}

        <button type="submit" className="btn-bar" disabled={sending}>
          {sending ? (
            <>
              <Spinner />
              Signing in
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </Shell>
  );
}
