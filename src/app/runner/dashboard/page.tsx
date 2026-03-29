"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Order, OrderStatus } from "@/lib/types";
import { sortOrdersByProximity } from "@/lib/dispatch";
import StatusBadge from "@/components/StatusBadge";
import Logo from "@/components/Logo";

const RUNNER_VENUE_ID = process.env.NEXT_PUBLIC_RUNNER_VENUE_ID;

export default function RunnerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [runnerId, setRunnerId] = useState<string | null>(null);
  const [runnerSection, setRunnerSection] = useState<string | null>(null);
  const [venueId, setVenueId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/runner/login");
        return;
      }

      setRunnerId(session.user.id);

      const { data: runner } = await supabase
        .from("runners")
        .select("venue_id, current_section")
        .eq("id", session.user.id)
        .single();

      const vid = runner?.venue_id ?? RUNNER_VENUE_ID ?? "";
      setVenueId(vid);
      setRunnerSection(runner?.current_section ?? null);
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  const fetchOrders = useCallback(async () => {
    if (!runnerId || !venueId) return;

    const res = await fetch(
      `/api/runners/orders?runner_id=${runnerId}&venue_id=${venueId}`
    );
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
  }, [runnerId, venueId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!venueId) return;

    const channel = supabase
      .channel(`runner-orders:${venueId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `venue_id=eq.${venueId}`,
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [venueId, fetchOrders]);

  async function updateStatus(orderId: string, newStatus: OrderStatus) {
    const body: Record<string, string> = { status: newStatus };
    if (newStatus === "assigned" && runnerId) body.runner_id = runnerId;

    await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    fetchOrders();
  }

  async function updateSection(newSection: string) {
    if (!runnerId) return;
    setRunnerSection(newSection);

    await supabase
      .from("runners")
      .update({ current_section: newSection })
      .eq("id", runnerId);

    fetchOrders();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/runner/login");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  const available = sortOrdersByProximity(
    orders.filter((o) => o.status === "ready" && !o.runner_id),
    runnerSection
  );
  const myOrders = orders.filter((o) => o.runner_id === runnerId);

  return (
    <div className="min-h-screen bg-stadium-dark">
      <header className="sticky top-0 z-50 bg-stadium-dark/95 backdrop-blur border-b border-brand-800/40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={true} />
            <span className="text-xs text-slate-500 ml-1">Runner Dashboard</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6 bg-stadium-medium rounded-xl border border-brand-800/30 p-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              My Section
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={runnerSection ?? ""}
                onChange={(e) => updateSection(e.target.value)}
                placeholder="e.g. 112"
                className="w-20 text-center bg-stadium-dark border border-brand-800/50 rounded-lg px-2 py-1.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <span className="text-[10px] text-slate-500">
                Orders sorted by proximity
              </span>
            </div>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            Available Orders
            {available.length > 0 && (
              <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">
                {available.length}
              </span>
            )}
          </h2>
          {available.length === 0 ? (
            <div className="text-sm text-slate-500 bg-stadium-medium rounded-lg p-4 text-center">
              No orders ready for pickup right now
            </div>
          ) : (
            <div className="space-y-3">
              {available.map((order, idx) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  runnerSection={runnerSection}
                  isNearest={idx === 0 && runnerSection !== null}
                  actions={
                    <button
                      onClick={() => updateStatus(order.id, "assigned")}
                      className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      Claim Order
                    </button>
                  }
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-400" />
            My Orders
            {myOrders.length > 0 && (
              <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">
                {myOrders.length}
              </span>
            )}
          </h2>
          {myOrders.length === 0 ? (
            <div className="text-sm text-slate-500 bg-stadium-medium rounded-lg p-4 text-center">
              You haven&apos;t claimed any orders yet
            </div>
          ) : (
            <div className="space-y-3">
              {myOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  actions={
                    <RunnerActions
                      order={order}
                      onUpdate={updateStatus}
                    />
                  }
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function OrderCard({
  order,
  actions,
  runnerSection,
  isNearest,
}: {
  order: Order;
  actions: React.ReactNode;
  runnerSection?: string | null;
  isNearest?: boolean;
}) {
  const seatLabel = `S${order.seat_section} R${order.seat_row} #${order.seat_number}`;

  const sectionDist = runnerSection
    ? Math.abs(parseInt(order.seat_section, 10) - parseInt(runnerSection, 10))
    : null;

  return (
    <div className={`bg-stadium-medium rounded-xl border p-4 ${
      isNearest ? "border-cyan-500/60 ring-1 ring-cyan-500/20" : "border-brand-800/30"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-mono text-brand-400 font-bold text-lg">
            {seatLabel}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>{order.vendor?.name} &middot; #{order.id.slice(0, 8)}</span>
            {sectionDist !== null && !isNaN(sectionDist) && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                sectionDist === 0
                  ? "bg-green-500/20 text-green-400"
                  : sectionDist <= 3
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "bg-amber-500/20 text-amber-400"
              }`}>
                {sectionDist === 0 ? "Your section" : `${sectionDist} sections away`}
              </span>
            )}
            {isNearest && (
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                Nearest
              </span>
            )}
          </div>
        </div>
        <StatusBadge status={order.status as OrderStatus} />
      </div>

      <div className="space-y-1 mb-3">
        {order.order_items?.map((item) => (
          <div key={item.id} className="text-sm text-slate-300">
            {item.quantity}x {item.name}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-brand-800/30">
        <span className="text-xs text-slate-500">
          {order.type === "delivery" ? "Deliver to seat" : "Pickup"} &middot; $
          {order.total.toFixed(2)}
        </span>
        {actions}
      </div>
    </div>
  );
}

function RunnerActions({
  order,
  onUpdate,
}: {
  order: Order;
  onUpdate: (id: string, status: OrderStatus) => void;
}) {
  const status = order.status as OrderStatus;

  if (status === "assigned") {
    return (
      <button
        onClick={() => onUpdate(order.id, "delivering")}
        className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        Picked Up
      </button>
    );
  }

  if (status === "delivering") {
    return (
      <button
        onClick={() => onUpdate(order.id, "delivered")}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        Delivered
      </button>
    );
  }

  return null;
}
