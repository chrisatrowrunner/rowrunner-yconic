import { OrderStatus, ORDER_STATUS_LABELS } from "@/lib/types";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  preparing: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  delivering: "bg-brand-500/20 text-brand-300 border-brand-500/30",
  delivered: "bg-green-500/20 text-green-400 border-green-500/30",
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[status]}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
