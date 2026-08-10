import { hashPassword, MIN_PASSWORD_LENGTH, requireStaff } from "@/lib/auth";
import { createStaff, getStaffByEmail } from "@/lib/db";
import { isEmail, trimmed } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Adds another person who can work the shop. */
export async function POST(request: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  const name = trimmed(body.name, 120);
  const email = trimmed(body.email, 160).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Add their name.";
  if (!email) errors.email = "Add an email address.";
  else if (!isEmail(email)) errors.email = "That email address looks off.";
  else if (getStaffByEmail(email)) errors.email = "Already in use.";
  if (password.length < MIN_PASSWORD_LENGTH)
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;

  if (Object.keys(errors).length > 0) {
    return Response.json(
      { message: "Check the highlighted fields.", errors },
      { status: 400 },
    );
  }

  createStaff({
    email,
    name,
    password_hash: await hashPassword(password),
    role: "staff",
  });

  return Response.json({ ok: true }, { status: 201 });
}
