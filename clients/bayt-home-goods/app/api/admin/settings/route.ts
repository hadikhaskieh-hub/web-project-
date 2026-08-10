import { requireStaff } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/db";
import { parseMoneyToCents } from "@/lib/money";
import { isEmail, trimmed } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  const errors: Record<string, string> = {};

  const storeName = trimmed(body.store_name, 60);
  if (!storeName) errors.store_name = "The shop needs a name.";

  const email = trimmed(body.store_email, 160);
  if (email && !isEmail(email)) errors.store_email = "That email looks off.";

  const fee = parseMoneyToCents(trimmed(body.delivery_fee, 20) || "0");
  if (fee === null) errors.delivery_fee = "Write the fee as a number, like 4.00.";

  const freeOver = parseMoneyToCents(trimmed(body.free_delivery_over, 20) || "0");
  if (freeOver === null)
    errors.free_delivery_over = "Write the threshold as a number, or 0 for none.";

  if (Object.keys(errors).length > 0) {
    return Response.json(
      { message: "Check the highlighted fields.", errors },
      { status: 400 },
    );
  }

  saveSettings({
    store_name: storeName,
    transfer_number: trimmed(body.transfer_number, 60),
    store_phone: trimmed(body.store_phone, 60),
    store_email: email,
    delivery_fee_cents: String(fee),
    free_delivery_over_cents: String(freeOver),
    cod_enabled: body.cod_enabled ? "1" : "0",
    transfer_enabled: body.transfer_enabled ? "1" : "0",
  });

  return Response.json({ ok: true, settings: getSettings() });
}
