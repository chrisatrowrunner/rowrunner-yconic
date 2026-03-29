"use client";

import { CartProvider } from "@/context/CartContext";

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
