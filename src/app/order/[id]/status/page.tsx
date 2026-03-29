"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Order, OrderStatus, ORDER_STATUS_STEPS, ORDER_STATUS_LABELS } from "@/lib/types";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";

export default function OrderStatusPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
      setLoading(false);
    }
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    const channel = supabase
      .channel(`order:${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder((prev) =>
            prev ? { ...prev, ...payload.new } : null
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-slate-400">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-slate-400">This order does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const currentStepIdx = ORDER_STATUS_STEPS.indexOf(order.status as OrderStatus);
  const seatLabel = `S${order.seat_section} R${order.seat_row} #${order.seat_number}`;

  return (
    <div className="min-h-screen bg-stadium-dark">
      <Header venueName="RowRunner" seat={seatLabel} />

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Order Tracking</h1>
          <StatusBadge status={order.status as OrderStatus} />
        </div>

        {/* Status timeline */}
        <div className="relative mb-8">
          {ORDER_STATUS_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            const isCancelled = order.status === "cancelled";

            return (
              <div key={step} className="flex items-start gap-4 mb-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isCancelled
                        ? "bg-red-500/20 border-2 border-red-500/50 text-red-400"
                        : isCurrent
                          ? "bg-brand-500 text-white ring-4 ring-brand-500/30"
                          : isCompleted
                            ? "bg-green-500 text-white"
                            : "bg-slate-700 text-slate-500"
                    }`}
                  >
                    {isCompleted && !isCurrent ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  {idx < ORDER_STATUS_STEPS.length - 1 && (
                    <div
                      className={`w-0.5 h-8 ${
                        isCompleted && idx < currentStepIdx
                          ? "bg-green-500"
                          : "bg-slate-700"
                      }`}
                    />
                  )}
                </div>
                <div className="pt-1">
                  <div
                    className={`text-sm font-medium ${
                      isCurrent
                        ? "text-brand-400"
                        : isCompleted
                          ? "text-slate-200"
                          : "text-slate-500"
                    }`}
                  >
                    {ORDER_STATUS_LABELS[step]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order details */}
        <div className="bg-stadium-medium rounded-xl border border-slate-700/50 p-4">
          <h3 className="font-semibold mb-3">Order Details</h3>
          <div className="space-y-2">
            {order.order_items?.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm"
              >
                <span className="text-slate-300">
                  {item.quantity}x {item.name}
                </span>
                <span className="text-slate-400">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-700 mt-3 pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Service fee</span>
              <span>${order.service_fee.toFixed(2)}</span>
            </div>
            {order.delivery_fee > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Delivery fee</span>
                <span>${order.delivery_fee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-100">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="text-xs text-slate-500">
            {order.type === "delivery" ? "Delivering to" : "Pickup order"}{" "}
            <span className="text-brand-400 font-mono">{seatLabel}</span>
          </div>
          <div className="text-xs text-slate-600 mt-1">
            Order #{order.id.slice(0, 8)}
          </div>
        </div>
      </main>
    </div>
  );
}
