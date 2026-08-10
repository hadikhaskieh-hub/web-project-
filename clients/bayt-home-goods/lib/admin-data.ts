import type {
  Category,
  OrderWithItems,
  ProductWithCategory,
  Settings,
  Staff,
} from "./db";

/** Everything the admin panel renders, in one payload. */
export type AdminData = {
  me: Omit<Staff, "password_hash">;
  orders: OrderWithItems[];
  products: ProductWithCategory[];
  categories: Category[];
  settings: Settings;
  team: Omit<Staff, "password_hash">[];
};

/** What every tab in the panel receives. */
export type TabProps = { data: AdminData; refresh: () => Promise<void> };
