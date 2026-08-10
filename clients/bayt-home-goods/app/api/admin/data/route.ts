import { requireStaff } from "@/lib/auth";
import type { AdminData } from "@/lib/admin-data";
import {
  getSettings,
  listCategories,
  listOrders,
  listProducts,
  listStaff,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const payload: AdminData = {
    me: guard.staff,
    orders: listOrders(),
    products: listProducts({ includeHidden: true }),
    categories: listCategories(),
    settings: getSettings(),
    team: listStaff(),
  };

  return Response.json(payload);
}
