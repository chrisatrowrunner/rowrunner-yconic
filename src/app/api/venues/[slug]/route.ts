import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .eq("slug", params.slug)
    .eq("active", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
