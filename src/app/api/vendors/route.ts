import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const venueId = searchParams.get("venue_id");

  if (!venueId) {
    return NextResponse.json({ error: "venue_id required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("venue_id", venueId)
    .eq("active", true)
    .order("name");

  if (error) {
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }

  return NextResponse.json(data);
}
