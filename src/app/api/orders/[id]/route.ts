import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { deriveTip, errorResponse, serverError } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServiceClient();

    const { data: order, error } = await supabase
      .from("orders")
      .select("*, order_items(*), vendor:vendors(name, description)")
      .eq("id", params.id)
      .single();

    if (error || !order) {
      return errorResponse("Order not found", 404);
    }

    order.tip_amount = deriveTip(order);
    order.tip_percent = 0;

    return NextResponse.json(order);
  } catch (err) {
    return serverError("Order fetch error", err);
  }
}
