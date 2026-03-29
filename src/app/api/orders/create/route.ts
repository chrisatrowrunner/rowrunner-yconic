import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";
import {
  calculateServiceFee,
  DELIVERY_FEE,
} from "@/lib/types";

interface CreateOrderItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CreateOrderBody {
  venue_id: string;
  vendor_id: string;
  seat_section: string;
  seat_row: string;
  seat_number: string;
  type: "delivery" | "pickup";
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  items: CreateOrderItem[];
}

export async function POST(request: Request) {
  try {
    const body: CreateOrderBody = await request.json();
    const {
      venue_id,
      vendor_id,
      seat_section,
      seat_row,
      seat_number,
      type,
      customer_name,
      customer_phone,
      customer_email,
      items,
    } = body;

    if (!venue_id || !vendor_id || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const serviceFee = calculateServiceFee(subtotal);
    const deliveryFee = type === "delivery" ? DELIVERY_FEE : 0;
    const total = Math.round((subtotal + serviceFee + deliveryFee) * 100) / 100;

    const supabase = getServiceClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        venue_id,
        vendor_id,
        seat_section,
        seat_row,
        seat_number,
        subtotal,
        service_fee: serviceFee,
        delivery_fee: deliveryFee,
        total,
        status: "pending",
        type,
        customer_name: customer_name || null,
        customer_phone: customer_phone || null,
        customer_email: customer_email || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    const orderItems = items.map((i) => ({
      order_id: order.id,
      menu_item_id: i.menu_item_id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items error:", itemsError);
    }

    const lineItems = items.map((i) => ({
      price_data: {
        currency: "usd",
        product_data: { name: i.name },
        unit_amount: Math.round(i.price * 100),
      },
      quantity: i.quantity,
    }));

    if (serviceFee > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Service Fee (10.5%)" },
          unit_amount: Math.round(serviceFee * 100),
        },
        quantity: 1,
      });
    }

    if (deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Delivery Fee" },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      ...(customer_email ? { customer_email } : {}),
      success_url: `${appUrl}/order/${order.id}/status?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/order?venue=rifc&section=${seat_section}&row=${seat_row}&seat=${seat_number}`,
      metadata: {
        order_id: order.id,
        customer_name: customer_name || "",
        customer_phone: customer_phone || "",
      },
    });

    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({
      order_id: order.id,
      checkout_url: session.url,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
