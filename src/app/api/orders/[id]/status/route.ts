import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { OrderStatus } from "@/lib/types";
import { errorResponse, serverError } from "@/lib/api";

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["preparing"],
  preparing: ["delivering"],
  delivering: ["delivered"],
  delivered: [],
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status, runner_id } = await request.json();
    const supabase = getServiceClient();

    const { data: current, error: fetchError } = await supabase
      .from("orders")
      .select("*, venue_id")
      .eq("id", params.id)
      .single();

    if (fetchError || !current) {
      return errorResponse("Order not found", 404);
    }

    const allowed = VALID_TRANSITIONS[current.status as OrderStatus] ?? [];
    if (!allowed.includes(status)) {
      return errorResponse(
        `Cannot transition from ${current.status} to ${status}`,
        400
      );
    }

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (runner_id) updateData.runner_id = runner_id;

    if (status === "delivered" && current.runner_id) {
      await supabase
        .from("runners")
        .update({ status: "idle" })
        .eq("id", current.runner_id);
    }

    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (updateError) {
      return errorResponse("Failed to update order", 500);
    }

    return NextResponse.json(updated);
  } catch (err) {
    return serverError("Status update error", err);
  }
}
