"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  calculateSubtotal,
  calculateServiceFee,
  DELIVERY_FEE,
} from "@/lib/types";
import Header from "@/components/Header";

function CheckoutInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { cart, orderType, clearCart } = useCart();

  const venueId = searchParams.get("venue_id") ?? "";
  const section = searchParams.get("section") ?? "";
  const row = searchParams.get("row") ?? "";
  const seat = searchParams.get("seat") ?? "";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [seatSection, setSeatSection] = useState(section);
  const [seatRow, setSeatRow] = useState(row);
  const [seatNumber, setSeatNumber] = useState(seat);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const items = cart?.items ?? [];
  const subtotal = calculateSubtotal(items);
  const serviceFee = calculateServiceFee(subtotal);
  const deliveryFee = orderType === "delivery" ? DELIVERY_FEE : 0;
  const total = Math.round((subtotal + serviceFee + deliveryFee) * 100) / 100;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stadium-dark flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">No Items in Cart</h1>
          <p className="text-slate-400 mb-6">Add items to your cart before checking out.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cart || items.length === 0) return;

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venue_id: venueId,
          vendor_id: cart.vendorId,
          seat_section: seatSection,
          seat_row: seatRow,
          seat_number: seatNumber,
          type: orderType,
          customer_name: name,
          customer_phone: phone,
          customer_email: email,
          items: items.map((ci) => ({
            menu_item_id: ci.menuItem.id,
            name: ci.menuItem.name,
            price: ci.menuItem.price,
            quantity: ci.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else if (data.order_id) {
        clearCart();
        router.push(`/order/${data.order_id}/status`);
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const seatLabel = seatSection && seatRow && seatNumber
    ? `S${seatSection} R${seatRow} #${seatNumber}`
    : undefined;

  return (
    <div className="min-h-screen bg-stadium-dark">
      <Header venueName="Checkout" seat={seatLabel} />

      <main className="max-w-lg mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to cart
        </button>

        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        {/* Order summary */}
        <div className="bg-stadium-medium rounded-xl border border-brand-800/30 p-4 mb-6">
          <div className="text-xs text-slate-400 mb-3">
            From <span className="text-brand-400 font-medium">{cart?.vendorName}</span>
            <span className="text-slate-600 mx-1">&middot;</span>
            <span>{orderType === "delivery" ? "Delivery" : "Pickup"}</span>
          </div>
          <div className="space-y-1 mb-3">
            {items.map((ci) => (
              <div key={ci.menuItem.id} className="flex justify-between text-sm">
                <span className="text-slate-300">{ci.quantity}x {ci.menuItem.name}</span>
                <span className="text-slate-400">${(ci.menuItem.price * ci.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-brand-800/30 pt-2 space-y-1 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Service fee (10.5%)</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Delivery fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-100 pt-1">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Checkout form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Your Info */}
          <fieldset>
            <legend className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-3">
              Your Info
            </legend>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stadium-medium border border-brand-800/40 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stadium-medium border border-brand-800/40 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stadium-medium border border-brand-800/40 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="you@email.com"
                  required
                />
              </div>
            </div>
          </fieldset>

          {/* Seat Info */}
          <fieldset>
            <legend className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-3">
              Seat Info
            </legend>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Section</label>
                <input
                  type="text"
                  value={seatSection}
                  onChange={(e) => setSeatSection(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stadium-medium border border-brand-800/40 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-center font-mono"
                  placeholder="112"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Row</label>
                <input
                  type="text"
                  value={seatRow}
                  onChange={(e) => setSeatRow(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stadium-medium border border-brand-800/40 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-center font-mono"
                  placeholder="H"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Seat</label>
                <input
                  type="text"
                  value={seatNumber}
                  onChange={(e) => setSeatNumber(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stadium-medium border border-brand-800/40 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-center font-mono"
                  placeholder="14"
                  required
                />
              </div>
            </div>
          </fieldset>

          {/* Payment note */}
          <div className="bg-brand-900/50 border border-brand-800/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <svg className="w-4 h-4 text-brand-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Payment info will be collected securely via Stripe on the next screen.
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white font-bold rounded-xl transition-colors text-lg"
          >
            {submitting ? "Processing..." : `Continue to Payment — $${total.toFixed(2)}`}
          </button>
        </form>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-slate-400">Loading...</div>
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}
