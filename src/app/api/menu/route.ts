import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { errorResponse, serverError } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendor_id");

    if (!vendorId) {
      return errorResponse("vendor_id required", 400);
    }

    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("vendor_id", vendorId)
      .eq("available", true)
      .order("category")
      .order("name");

    if (error) {
      return errorResponse("Failed to fetch menu", 500);
    }

    return NextResponse.json(data);
  } catch (err) {
    return serverError("Menu error", err);
  }
}
