/**
 * Order statuses. Kept out of lib/db so the admin panel can import them in
 * the browser without dragging the database driver along.
 */

export type OrderStatus =
  | "new"
  | "confirmed"
  | "packed"
  | "out"
  | "delivered"
  | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "confirmed",
  "packed",
  "out",
  "delivered",
  "cancelled",
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  new: "New",
  confirmed: "Confirmed",
  packed: "Packed",
  out: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export type PaymentMethod = "cod" | "transfer";
