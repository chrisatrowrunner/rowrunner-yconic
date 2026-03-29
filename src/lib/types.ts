export interface Venue {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  created_at: string;
}

export interface Vendor {
  id: string;
  venue_id: string;
  name: string;
  description: string;
  active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  price: number;
  category: "food" | "drink" | "alcohol" | "merch";
  available: boolean;
  created_at: string;
}

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "assigned"
  | "delivering"
  | "delivered"
  | "cancelled";

export type OrderType = "delivery" | "pickup";

export interface Order {
  id: string;
  venue_id: string;
  vendor_id: string;
  runner_id: string | null;
  seat_section: string;
  seat_row: string;
  seat_number: string;
  subtotal: number;
  service_fee: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  type: OrderType;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  vendor?: Vendor;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Runner {
  id: string;
  email: string;
  venue_id: string;
  current_section: string | null;
  status: "idle" | "busy";
  created_at: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Cart {
  vendorId: string;
  vendorName: string;
  items: CartItem[];
}

export const SERVICE_FEE_RATE = 0.105;
export const DELIVERY_FEE = 2.0;

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
}

export function calculateServiceFee(subtotal: number): number {
  return Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100;
}

export function calculateTotal(subtotal: number, type: OrderType): number {
  const serviceFee = calculateServiceFee(subtotal);
  const deliveryFee = type === "delivery" ? DELIVERY_FEE : 0;
  return Math.round((subtotal + serviceFee + deliveryFee) * 100) / 100;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Order Placed",
  accepted: "Order Accepted",
  preparing: "Being Prepared",
  ready: "Ready",
  assigned: "Runner Assigned",
  delivering: "On the Way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_STEPS: OrderStatus[] = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "assigned",
  "delivering",
  "delivered",
];
