import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vendorId = searchParams.get("vendor_id");

  if (!vendorId) {
    return NextResponse.json({ error: "vendor_id required" }, { status: 400 });
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
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }

  return NextResponse.json(data);
}
