"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Vendor, MenuItem } from "@/lib/types";
import { useCart } from "@/context/CartContext";

interface MenuViewProps {
  vendor: Vendor;
  venueSlug: string;
  onBack: () => void;
}

const CATEGORY_ORDER = ["food", "drink", "alcohol", "merch"] as const;
const CATEGORY_LABELS: Record<string, string> = {
  food: "Food",
  drink: "Drinks",
  alcohol: "Alcohol",
  merch: "Merch",
};

export default function MenuView({ vendor, onBack }: MenuViewProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, cart } = useCart();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .eq("vendor_id", vendor.id)
        .eq("available", true)
        .order("category")
        .order("name");

      setItems(data ?? []);
      setLoading(false);
    }
    load();
  }, [vendor.id]);

  const grouped = CATEGORY_ORDER.reduce(
    (acc, cat) => {
      const catItems = items.filter((i) => i.category === cat);
      if (catItems.length > 0) acc[cat] = catItems;
      return acc;
    },
    {} as Record<string, MenuItem[]>
  );

  const getItemQuantity = (itemId: string) => {
    if (!cart || cart.vendorId !== vendor.id) return 0;
    const ci = cart.items.find((i) => i.menuItem.id === itemId);
    return ci?.quantity ?? 0;
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to vendors
      </button>

      <h2 className="text-2xl font-bold mb-1">{vendor.name}</h2>
      <p className="text-slate-400 text-sm mb-6">{vendor.description}</p>

      {loading ? (
        <div className="text-center py-12 text-slate-400 animate-pulse">
          Loading menu...
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, catItems]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-3">
                {CATEGORY_LABELS[category] ?? category}
              </h3>
              <div className="space-y-2">
                {catItems.map((item) => {
                  const qty = getItemQuantity(item.id);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-stadium-medium rounded-lg border border-brand-800/30"
                    >
                      <div className="flex-1 mr-3">
                        <div className="font-medium text-slate-100">
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-xs text-slate-400 mt-0.5">
                            {item.description}
                          </div>
                        )}
                        <div className="text-sm text-brand-400 font-semibold mt-1">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => addItem(item, vendor.id, vendor.name)}
                        className="flex-shrink-0 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors active:scale-95"
                      >
                        {qty > 0 ? `Add (${qty})` : "Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
