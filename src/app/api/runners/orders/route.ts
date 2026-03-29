import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

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

  return NextResponse.json(data);
}
