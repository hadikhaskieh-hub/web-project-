import "server-only";

import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";

import {
  createSession,
  deleteSession,
  getSessionStaff,
  type Staff,
} from "./db";

const scrypt = promisify(scryptCallback) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
) => Promise<Buffer>;

export const SESSION_COOKIE = "bayt_session";
export const MIN_PASSWORD_LENGTH = 8;

const KEY_LENGTH = 64;

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (value && value.length > 0) return value;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET is not set. Copy .env.example to .env.local and set it before running in production.",
    );
  }
  // Development convenience only. Sessions reset whenever the server restarts.
  return "bayt-development-secret-not-for-production";
}

/* ------------------------------------------------------------------ *\
   Passwords
\* ------------------------------------------------------------------ */

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;

  const expected = Buffer.from(hash, "hex");
  const derived = await scrypt(password, salt, expected.length || KEY_LENGTH);

  return (
    expected.length === derived.length && timingSafeEqual(expected, derived)
  );
}

/* ------------------------------------------------------------------ *\
   Signed session cookie
\* ------------------------------------------------------------------ */

function sign(sessionId: string): string {
  return createHmac("sha256", secret()).update(sessionId).digest("hex");
}

function unwrap(cookieValue: string): string | null {
  const separator = cookieValue.lastIndexOf(".");
  if (separator <= 0) return null;

  const sessionId = cookieValue.slice(0, separator);
  const signature = Buffer.from(cookieValue.slice(separator + 1), "hex");
  const expected = Buffer.from(sign(sessionId), "hex");

  if (signature.length !== expected.length) return null;
  if (!timingSafeEqual(signature, expected)) return null;

  return sessionId;
}

export async function startSession(staffId: number) {
  const sessionId = createSession(staffId);
  const jar = await cookies();

  jar.set(SESSION_COOKIE, `${sessionId}.${sign(sessionId)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 14 * 24 * 60 * 60,
  });
}

export async function endSession() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;

  if (raw) {
    const sessionId = unwrap(raw);
    if (sessionId) deleteSession(sessionId);
  }

  jar.delete(SESSION_COOKIE);
}

/** The signed in staff member, or null. Safe to call from any server code. */
export async function currentStaff(): Promise<Omit<
  Staff,
  "password_hash"
> | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const sessionId = unwrap(raw);
  if (!sessionId) return null;

  return getSessionStaff(sessionId) ?? null;
}

/**
 * Guard for admin API routes. Returns either the staff member or a ready
 * made 401 to return straight from the handler.
 */
export async function requireStaff(): Promise<
  | { ok: true; staff: Omit<Staff, "password_hash"> }
  | { ok: false; response: Response }
> {
  const staff = await currentStaff();
  if (staff) return { ok: true, staff };

  return {
    ok: false,
    response: Response.json(
      { error: "Sign in to continue." },
      { status: 401 },
    ),
  };
}
