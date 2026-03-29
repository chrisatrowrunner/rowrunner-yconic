import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { sortOrdersByProximity } from "@/lib/dispatch";
import { Order } from "@/lib/types";
import { deriveTip, errorResponse } from "@/lib/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const runnerId = searchParams.get("runner_id");
  const venueId = searchParams.get("venue_id");

  if (!runnerId || !venueId) {
    return errorResponse("runner_id and venue_id required", 400);
  }

  const supabase = getServiceClient();

  const { data: runner } = await supabase
    .from("runners")
    .select("current_section")
    .eq("id", runnerId)
    .single();

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*), vendor:vendors(name)")
    .eq("venue_id", venueId)
    .in("status", ["preparing", "delivering"])
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Runner orders error:", error);
    return errorResponse("Failed to fetch orders", 500);
  }

  const orders = (data ?? []).map((o: Record<string, unknown>) => ({
    ...o,
    tip_amount: deriveTip(o),
    tip_percent: 0,
  }) as Order);

  const runnerSection = runner?.current_section ?? null;
  const available = orders.filter((o) => !o.runner_id);
  const myOrders = orders.filter((o) => o.runner_id === runnerId);

  return NextResponse.json([
    ...sortOrdersByProximity(available, runnerSection),
    ...myOrders,
  ]);
}
