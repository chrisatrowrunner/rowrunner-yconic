"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Cart, MenuItem, OrderType } from "@/lib/types";

interface CartContextType {
  cart: Cart | null;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  addItem: (item: MenuItem, vendorId: string, vendorName: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [orderType, setOrderType] = useState<OrderType>("delivery");

  const addItem = useCallback(
    (item: MenuItem, vendorId: string, vendorName: string) => {
      setCart((prev) => {
        if (prev && prev.vendorId !== vendorId) {
          // Switching vendors — reset cart
          return {
            vendorId,
            vendorName,
            items: [{ menuItem: item, quantity: 1 }],
          };
        }

        if (!prev) {
          return {
            vendorId,
            vendorName,
            items: [{ menuItem: item, quantity: 1 }],
          };
        }

        const existing = prev.items.find((ci) => ci.menuItem.id === item.id);
        if (existing) {
          return {
            ...prev,
            items: prev.items.map((ci) =>
              ci.menuItem.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
            ),
          };
        }

        return {
          ...prev,
          items: [...prev.items, { menuItem: item, quantity: 1 }],
        };
      });
    },
    []
  );

  const removeItem = useCallback((menuItemId: string) => {
    setCart((prev) => {
      if (!prev) return null;
      const items = prev.items.filter((ci) => ci.menuItem.id !== menuItemId);
      return items.length === 0 ? null : { ...prev, items };
    });
  }, []);

  const updateQuantity = useCallback((menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(menuItemId);
    }
    setCart((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.map((ci) =>
          ci.menuItem.id === menuItemId ? { ...ci, quantity } : ci
        ),
      };
    });
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setCart(null);
  }, []);

  const itemCount = cart?.items.reduce((sum, ci) => sum + ci.quantity, 0) ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        orderType,
        setOrderType,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
