"use client";

import { Vendor } from "@/lib/types";

interface VendorListProps {
  vendors: Vendor[];
  onSelect: (vendor: Vendor) => void;
}

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
