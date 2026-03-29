"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CartProvider } from "@/context/CartContext";
import OrderFlow from "./OrderFlow";

function OrderPageInner() {
  const searchParams = useSearchParams();
  const venueSlug = searchParams.get("venue") ?? "";
  const section = searchParams.get("section") ?? "";
  const row = searchParams.get("row") ?? "";
  const seat = searchParams.get("seat") ?? "";

  if (!venueSlug) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Missing Venue</h1>
          <p className="text-slate-400">
            Scan the QR code at your seat to start ordering.
          </p>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
      <OrderFlow
        venueSlug={venueSlug}
        section={section}
        row={row}
        seat={seat}
      />
    </CartProvider>
  );
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-slate-400">Loading...</div>
        </div>
      }
    >
      <OrderPageInner />
    </Suspense>
  );
}
