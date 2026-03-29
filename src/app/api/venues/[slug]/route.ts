import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { errorResponse, serverError } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .eq("slug", params.slug)
      .eq("active", true)
      .single();

    if (error || !data) {
      return errorResponse("Venue not found", 404);
    }

    return NextResponse.json(data);
  } catch (err) {
    return serverError("Venue error", err);
  }
}
