import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { OrderStatus } from "@/lib/types";

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["assigned"],
  assigned: ["delivering"],
  delivering: ["delivered"],
  delivered: [],
  cancelled: [],
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
      .select("status")
      .eq("id", params.id)
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const allowed = VALID_TRANSITIONS[current.status as OrderStatus] ?? [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        {
          error: `Cannot transition from ${current.status} to ${status}`,
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (runner_id) updateData.runner_id = runner_id;

    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
