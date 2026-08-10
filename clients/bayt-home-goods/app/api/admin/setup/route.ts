import {
  hashPassword,
  MIN_PASSWORD_LENGTH,
  startSession,
} from "@/lib/auth";
import { countStaff, createStaff, getStaffByEmail } from "@/lib/db";
import { isEmail, trimmed } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Creates the owner account. Only reachable while the staff table is empty.
 * Once one account exists this path is closed for good.
 */
export async function POST(request: Request) {
  if (countStaff() > 0) {
    return Response.json(
      { message: "This shop already has an owner account. Sign in instead." },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  const name = trimmed(body.name, 120);
  const email = trimmed(body.email, 160).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Add your name.";
  if (!email) errors.email = "Add an email address.";
  else if (!isEmail(email)) errors.email = "That email address looks off.";
  if (password.length < MIN_PASSWORD_LENGTH)
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;

  if (Object.keys(errors).length > 0) {
    return Response.json(
      { message: "Check the highlighted fields.", errors },
      { status: 400 },
    );
  }

  if (getStaffByEmail(email)) {
    return Response.json(
      { message: "That email is already in use.", errors: { email: "Already in use." } },
      { status: 400 },
    );
  }

  const id = createStaff({
    email,
    name,
    password_hash: await hashPassword(password),
    role: "owner",
  });

  await startSession(id);

  return Response.json({ ok: true }, { status: 201 });
}
