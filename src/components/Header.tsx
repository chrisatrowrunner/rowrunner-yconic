"use client";

import Link from "next/link";
import Logo from "./Logo";

interface HeaderProps {
  venueName?: string;
  seat?: string;
  showCart?: boolean;
  cartCount?: number;
  onCartClick?: () => void;
}

export default function Header({
  venueName,
  seat,
  showCart,
  cartCount,
  onCartClick,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-stadium-dark/95 backdrop-blur border-b border-brand-800/40">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo size="sm" showText={true} />
        </Link>

        <div className="flex items-center gap-3">
          {venueName && (
            <div className="text-right">
              <div className="text-xs text-slate-400">{venueName}</div>
              {seat && <div className="text-xs text-brand-400 font-mono">{seat}</div>}
            </div>
          )}
          {showCart && (
            <button
              onClick={onCartClick}
              className="relative p-2 rounded-lg hover:bg-stadium-medium transition-colors"
            >
              <svg
                className="w-6 h-6 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
              {cartCount !== undefined && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
