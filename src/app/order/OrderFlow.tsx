"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Venue, Vendor } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import VendorList from "./VendorList";
import MenuView from "./MenuView";
import CartSheet from "./CartSheet";

interface OrderFlowProps {
  venueSlug: string;
  section: string;
  row: string;
  seat: string;
}

export default function OrderFlow({ venueSlug, section, row, seat }: OrderFlowProps) {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const { itemCount } = useCart();

  useEffect(() => {
    async function load() {
      const { data: venueData } = await supabase
        .from("venues")
        .select("*")
        .eq("slug", venueSlug)
        .eq("active", true)
        .single();

      if (venueData) {
        setVenue(venueData);
        const { data: vendorData } = await supabase
          .from("vendors")
          .select("*")
          .eq("venue_id", venueData.id)
          .eq("active", true)
          .order("name");

        setVendors(vendorData ?? []);
      }
      setLoading(false);
    }
    load();
  }, [venueSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-slate-400">Loading venue...</div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Venue Not Found</h1>
          <p className="text-slate-400">
            This venue is not available. Please scan a valid QR code.
          </p>
        </div>
      </div>
    );
  }

  const seatLabel = section && row && seat ? `S${section} R${row} #${seat}` : undefined;

  return (
    <div className="min-h-screen bg-stadium-dark">
      <Header
        venueName={venue.name}
        seat={seatLabel}
        showCart
        cartCount={itemCount}
        onCartClick={() => setCartOpen(true)}
      />

      <main className="max-w-lg mx-auto px-4 py-6">
        {!selectedVendor ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">What are you craving?</h2>
              <p className="text-slate-400 text-sm">
                Choose a vendor to browse their menu
              </p>
            </div>
            <VendorList vendors={vendors} onSelect={setSelectedVendor} />
          </>
        ) : (
          <MenuView
            vendor={selectedVendor}
            venueSlug={venueSlug}
            onBack={() => setSelectedVendor(null)}
          />
        )}
      </main>

      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        venueSlug={venueSlug}
        venueId={venue.id}
        section={section}
        row={row}
        seat={seat}
      />
    </div>
  );
}
