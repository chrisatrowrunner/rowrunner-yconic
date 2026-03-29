"use client";

import { Vendor } from "@/lib/types";

interface VendorListProps {
  vendors: Vendor[];
  onSelect: (vendor: Vendor) => void;
}

const VENDOR_ICONS: Record<string, string> = {
  grill: "M17.6568 14.8284L16.2426 13.4142L17.6568 12C19.2189 10.4379 19.2189 7.90524 17.6568 6.34315C16.0947 4.78105 13.5621 4.78105 12 6.34315L10.5858 7.75736L9.17157 6.34315L10.5858 4.92893C12.9289 2.58579 16.7279 2.58579 19.0711 4.92893C21.4142 7.27208 21.4142 11.0711 19.0711 13.4142L17.6568 14.8284Z",
  drinks: "M20 3H4L6 20.5C6.1 21.1 6.5 21.5 7 21.5H17C17.5 21.5 17.9 21.1 18 20.5L20 3ZM16 7L15 17H9L8 7H16Z",
  default: "M3 3H21L19 13H5L3 3ZM5.5 16H18.5C19 16 19.5 16.5 19.5 17C19.5 17.5 19 18 18.5 18H5.5C5 18 4.5 17.5 4.5 17C4.5 16.5 5 16 5.5 16ZM7 20H17C17.5 20 18 20.5 18 21C18 21.5 17.5 22 17 22H7C6.5 22 6 21.5 6 21C6 20.5 6.5 20 7 20Z",
};

export default function VendorList({ vendors, onSelect }: VendorListProps) {
  if (vendors.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        No vendors available at this venue right now.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {vendors.map((vendor) => (
        <button
          key={vendor.id}
          onClick={() => onSelect(vendor)}
          className="w-full flex items-center gap-4 p-4 bg-stadium-medium hover:bg-stadium-light rounded-xl border border-slate-700/50 transition-all active:scale-[0.98]"
        >
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand-500/10 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-brand-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold text-slate-100">{vendor.name}</div>
            <div className="text-sm text-slate-400">{vendor.description}</div>
          </div>
          <svg
            className="w-5 h-5 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}
