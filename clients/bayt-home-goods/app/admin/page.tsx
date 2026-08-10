import { AdminGate } from "@/components/admin/admin-gate";
import { AdminPanel } from "@/components/admin/admin-panel";
import type { AdminData } from "@/lib/admin-data";
import { currentStaff } from "@/lib/auth";
import {
  countStaff,
  getSettings,
  listCategories,
  listOrders,
  listProducts,
  listStaff,
} from "@/lib/db";

export default async function AdminPage() {
  const staffCount = countStaff();

  // First run. No accounts exist, so offer to create the owner.
  if (staffCount === 0) return <AdminGate firstRun />;

  const me = await currentStaff();
  if (!me) return <AdminGate firstRun={false} />;

  const initial: AdminData = {
    me,
    orders: listOrders(),
    products: listProducts({ includeHidden: true }),
    categories: listCategories(),
    settings: getSettings(),
    team: listStaff(),
  };

  return <AdminPanel initial={initial} />;
}
