import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { assignRunner } from "@/lib/dispatch";
import { Order, Runner } from "@/lib/types";

/**
 * POST /api/runners/dispatch
 *
 * Auto-assigns the nearest idle runner to an order based on
 * section proximity. Called when an order transitions to "ready".
 *
 * Body: { order_id: string, venue_id: string }
 * Returns the assigned runner or a message if none available.
 */
export async function POST(request: Request) {
  try {
    const { order_id, venue_id } = await request.json();

    if (!order_id || !venue_id) {
      return NextResponse.json(
        { error: "order_id and venue_id required" },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "ready") {
      return NextResponse.json(
        { error: "Order is not in ready state" },
        { status: 400 }
      );
    }

    const { data: runners, error: runnerError } = await supabase
      .from("runners")
      .select("*")
      .eq("venue_id", venue_id)
      .eq("status", "idle");

    if (runnerError) {
      return NextResponse.json(
        { error: "Failed to fetch runners" },
        { status: 500 }
      );
    }

    const bestRunner = assignRunner(order as Order, (runners ?? []) as Runner[]);

    if (!bestRunner) {
      return NextResponse.json({
        assigned: false,
        message: "No idle runners available — order remains in ready queue",
      });
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "assigned",
        runner_id: bestRunner.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to assign runner" },
        { status: 500 }
      );
    }

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
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
