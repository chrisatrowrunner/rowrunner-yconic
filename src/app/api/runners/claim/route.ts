import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { errorResponse, serverError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const { order_id, runner_id } = await request.json();

    if (!order_id || !runner_id) {
      return errorResponse("order_id and runner_id required", 400);
    }

    const supabase = getServiceClient();

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, status, runner_id")
      .eq("id", order_id)
      .single();

    if (fetchError || !order) {
      return errorResponse("Order not found", 404);
    }

    if (order.runner_id) {
      return errorResponse("Order already claimed", 409);
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ runner_id, updated_at: new Date().toISOString() })
      .eq("id", order_id);

    if (updateError) {
      return errorResponse("Failed to claim order", 500);
    }

    await supabase
      .from("runners")
      .update({ status: "busy" })
      .eq("id", runner_id);

    return NextResponse.json({ claimed: true });
  } catch (err) {
    return serverError("Claim order error", err);
  }
}
