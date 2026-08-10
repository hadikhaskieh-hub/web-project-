import { endSession, startSession, verifyPassword } from "@/lib/auth";
import { getStaffByEmail } from "@/lib/db";
import { trimmed } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Sign in. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  const email = trimmed(body.email, 160).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return Response.json(
      { message: "Enter your email and password." },
      { status: 400 },
    );
  }

  const staff = getStaffByEmail(email);

  // Same reply either way, so this cannot be used to find out who has an
  // account here.
  const failure = Response.json(
    { message: "That email and password do not match." },
    { status: 401 },
  );

  if (!staff) {
    // Burn roughly the same time as a real check would take.
    await verifyPassword(password, "scrypt$0000$0000");
    return failure;
  }

  if (!(await verifyPassword(password, staff.password_hash))) return failure;

  await startSession(staff.id);

  return Response.json({ ok: true });
}

/** Sign out. */
export async function DELETE() {
  await endSession();
  return Response.json({ ok: true });
}
