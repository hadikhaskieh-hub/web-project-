import { requireStaff } from "@/lib/auth";
import {
  getOrderByCode,
  ORDER_STATUSES,
  setOrderStatus,
  type OrderStatus,
} from "@/lib/db";
import { trimmed } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Moves one order to a new status. */
export async function PATCH(request: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  const code = trimmed(body.code, 20).toUpperCase();
  const status = trimmed(body.status, 20) as OrderStatus;

  if (!code || !ORDER_STATUSES.includes(status)) {
    return Response.json({ message: "Unknown order or status." }, { status: 400 });
  }

  if (!getOrderByCode(code)) {
    return Response.json({ message: "That order is gone." }, { status: 404 });
  }

  setOrderStatus(code, status);

  return Response.json({ ok: true, code, status });
}
