import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { assignRunner } from "@/lib/dispatch";
import { Order, Runner } from "@/lib/types";
import { errorResponse, serverError } from "@/lib/api";

/**
 * POST /api/runners/dispatch
 *
 * Auto-assigns the nearest idle runner to an order based on
 * section proximity. Called after payment when an order enters "preparing".
 *
 * Body: { order_id: string, venue_id: string }
 */
export async function POST(request: Request) {
  try {
    const { order_id, venue_id } = await request.json();

    if (!order_id || !venue_id) {
      return errorResponse("order_id and venue_id required", 400);
    }

    const supabase = getServiceClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return errorResponse("Order not found", 404);
    }

    if (order.status !== "preparing") {
      return errorResponse("Order is not in preparing state", 400);
    }

    const { data: runners, error: runnerError } = await supabase
      .from("runners")
      .select("*")
      .eq("venue_id", venue_id)
      .eq("status", "idle");

    if (runnerError) {
      return errorResponse("Failed to fetch runners", 500);
    }

    const bestRunner = assignRunner(order as Order, (runners ?? []) as Runner[]);

    if (!bestRunner) {
      return NextResponse.json({
        assigned: false,
        message: "No idle runners available — order visible in runner queue",
      });
    }

    await supabase
      .from("orders")
      .update({
        runner_id: bestRunner.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    await supabase
      .from("runners")
      .update({ status: "busy" })
      .eq("id", bestRunner.id);

    return NextResponse.json({
      assigned: true,
      runner_id: bestRunner.id,
      runner_section: bestRunner.current_section,
      order_section: order.seat_section,
    });
  } catch (err) {
    return serverError("Dispatch error", err);
  }
}
