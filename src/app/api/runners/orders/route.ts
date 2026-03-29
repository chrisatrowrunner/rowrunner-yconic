import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { sortOrdersByProximity } from "@/lib/dispatch";
import { Order } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const runnerId = searchParams.get("runner_id");
  const venueId = searchParams.get("venue_id");

  if (!runnerId || !venueId) {
    return NextResponse.json(
      { error: "runner_id and venue_id required" },
      { status: 400 }
    );
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
    .or(`runner_id.eq.${runnerId},and(runner_id.is.null,status.in.(ready))`)
    .not("status", "in", '("delivered","cancelled")')
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Runner orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }

  const orders = (data ?? []) as Order[];
  const runnerSection = runner?.current_section ?? null;

  const available = orders.filter((o) => o.status === "ready" && !o.runner_id);
  const claimed = orders.filter((o) => o.runner_id === runnerId);

  const sortedAvailable = sortOrdersByProximity(available, runnerSection);

  return NextResponse.json([...sortedAvailable, ...claimed]);
}
