import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { errorResponse, serverError } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venue_id");

    if (!venueId) {
      return errorResponse("venue_id required", 400);
    }

    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .eq("venue_id", venueId)
      .eq("active", true)
      .order("name");

    if (error) {
      return errorResponse("Failed to fetch vendors", 500);
    }

    return NextResponse.json(data);
  } catch (err) {
    return serverError("Vendors error", err);
  }
}
