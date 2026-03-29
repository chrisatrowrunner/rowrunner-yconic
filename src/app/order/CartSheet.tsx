"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  calculateSubtotal,
  calculateServiceFee,
  DELIVERY_FEE,
  OrderType,
} from "@/lib/types";

interface CartSheetProps {
  open: boolean;
  onClose: () => void;
  venueSlug: string;
  venueId: string;
  section: string;
  row: string;
  seat: string;
}

export default function CartSheet({
  open,
  onClose,
  venueSlug,
  venueId,
  section,
  row,
  seat,
}: CartSheetProps) {
  const { cart, orderType, setOrderType, updateQuantity, removeItem, clearCart } =
    useCart();
  const router = useRouter();

  if (!open) return null;

  const items = cart?.items ?? [];
  const subtotal = calculateSubtotal(items);
  const serviceFee = calculateServiceFee(subtotal);
  const deliveryFee = orderType === "delivery" ? DELIVERY_FEE : 0;
  const total = Math.round((subtotal + serviceFee + deliveryFee) * 100) / 100;

  function handleContinue() {
    if (!cart || items.length === 0) return;
    onClose();
    router.push(
      `/order/checkout?venue=${venueSlug}&venue_id=${venueId}&section=${section}&row=${row}&seat=${seat}`
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-stadium-dark border-t border-brand-800/40 rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
        <div className="max-w-lg mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Order</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stadium-medium rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Your cart is empty. Browse a menu to add items.
            </div>
          ) : (
            <>
              <div className="text-xs text-slate-400 mb-2">
                From <span className="text-brand-400 font-medium">{cart?.vendorName}</span>
              </div>

              <div className="space-y-2 mb-4">
                {items.map((ci) => (
                  <div
                    key={ci.menuItem.id}
                    className="flex items-center justify-between p-3 bg-stadium-medium rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium">{ci.menuItem.name}</div>
                      <div className="text-xs text-slate-400">
                        ${ci.menuItem.price.toFixed(2)} each
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          ci.quantity <= 1
                            ? removeItem(ci.menuItem.id)
                            : updateQuantity(ci.menuItem.id, ci.quantity - 1)
                        }
                        className="w-7 h-7 rounded-md bg-brand-800 hover:bg-brand-700 flex items-center justify-center text-sm transition-colors"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm font-medium">
                        {ci.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(ci.menuItem.id, ci.quantity + 1)
                        }
                        className="w-7 h-7 rounded-md bg-brand-800 hover:bg-brand-700 flex items-center justify-center text-sm transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order type toggle */}
              <div className="flex gap-2 mb-4">
                {(["delivery", "pickup"] as OrderType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setOrderType(type)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      orderType === type
                        ? "bg-brand-500 text-white"
                        : "bg-stadium-medium text-slate-400 hover:bg-stadium-light"
                    }`}
                  >
                    {type === "delivery" ? "Deliver to Seat" : "Pickup Window"}
                  </button>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="space-y-1 text-sm border-t border-brand-800/40 pt-3 mb-4">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Service fee (10.5%)</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                {orderType === "delivery" && (
                  <div className="flex justify-between text-slate-400">
                    <span>Delivery fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-slate-100 pt-1">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleContinue}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors text-lg"
              >
                Continue to Checkout
              </button>

              <button
                onClick={clearCart}
                className="w-full mt-2 py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear cart
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
