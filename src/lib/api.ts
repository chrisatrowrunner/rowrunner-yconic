import { NextResponse } from "next/server";

/**
 * Derive tip amount from order totals.
 * Because PostgREST schema cache doesn't expose the tip columns,
 * we compute tip = total - subtotal - service_fee - delivery_fee.
 */
export function deriveTip(order: Record<string, unknown>): number {
  const total = Number(order.total ?? 0);
  const subtotal = Number(order.subtotal ?? 0);
  const serviceFee = Number(order.service_fee ?? 0);
  const deliveryFee = Number(order.delivery_fee ?? 0);
  return Math.max(0, Math.round((total - subtotal - serviceFee - deliveryFee) * 100) / 100);
}

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function serverError(label: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`${label}:`, message);
  return NextResponse.json(
    { error: message || "Internal server error" },
    { status: 500 }
  );
}
