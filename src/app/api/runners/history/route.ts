import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { deriveTip, errorResponse } from "@/lib/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const runnerId = searchParams.get("runner_id");

  if (!runnerId) {
    return errorResponse("runner_id required", 400);
  }

  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("orders")
    .select("id, total, subtotal, service_fee, delivery_fee, seat_section, seat_row, seat_number, customer_name, created_at, vendor:vendors(name)")
    .eq("runner_id", runnerId)
    .eq("status", "delivered")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Runner history error:", error);
    return errorResponse("Failed to fetch history", 500);
  }

  const orders = (data ?? []).map((o: Record<string, unknown>) => ({
    ...o,
    tip_amount: deriveTip(o),
  }));

  const totalTips = orders.reduce((sum, o) => sum + (o.tip_amount as number), 0);

  return NextResponse.json({
    orders,
    totalTips: Math.round(totalTips * 100) / 100,
    count: orders.length,
  });
}
