# RowRunner

**In-seat food, beverage, and pickup ordering for live sporting events.**

RowRunner eliminates concession lines at stadiums. Fans scan a QR code at their seat, browse nearby vendor menus, pay via Stripe, and receive delivery from a runner — or pick up at a dedicated window. Venues pay nothing. Runners keep 100% of tips. RowRunner earns a 10.5% fan-side service fee plus a $2.00 flat delivery fee per order.

Built for the underserved 7,000–30,000 seat venue segment — minor league baseball, lower-division soccer, mid-size arenas — where enterprise solutions do not operate.

**Demo venue:** Rhode Island FC at Beirne Stadium (slug: `rifc`)

---

## How It Works

1. **Fan scans QR code** — URL encodes venue, section, row, and seat (`/order?venue=rifc&section=112&row=H&seat=14`)
2. **Browse & order** — Fan selects a vendor, adds items to cart, chooses delivery or pickup
3. **Pay via Stripe** — 10.5% service fee + $2.00 delivery fee applied at checkout
4. **Real-time tracking** — Order status updates live via Supabase Realtime (no polling)
5. **Runner delivers** — Runner claims order from dashboard, marks picked up, then delivered

## Key Innovations

- **Seat-as-address** — Structured section/row/seat replaces GPS entirely, solving the indoor location problem that breaks traditional delivery apps inside stadiums
- **Runner proximity dispatch** — When an order becomes "ready", the system automatically assigns the nearest idle runner using section-distance calculation (`|runner_section - order_section|`). Runners set their current section from the dashboard; available orders are sorted nearest-first with visual proximity badges. Fallback to manual claim when no idle runners are available.
- **Venue-scoped real-time** — Supabase Realtime channels scoped per venue, enabling efficient broadcast to all stakeholders simultaneously
- **Fee-side revenue model** — All revenue is fan-side (10.5% service fee + $2.00 delivery fee), making the venue pitch zero-cost and the vendor pitch commission-free

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Real-time | Supabase Realtime (WebSocket) |
| Auth | Supabase Auth (email/password for runners) |
| Payments | Stripe Checkout (test mode) |
| Deployment | Vercel |

---

## Architecture

```
Fan (mobile browser)
  │
  ├── /order?venue=rifc&section=112&row=H&seat=14
  │     ├── VendorList → MenuView → CartSheet
  │     └── POST /api/orders/create → Stripe Checkout
  │
  ├── /order/[id]/status
  │     └── Supabase Realtime subscription (live updates)
  │
Runner (authenticated)
  │
  ├── /runner/login → Supabase Auth
  └── /runner/dashboard
        ├── Section selector (runner sets current location)
        ├── Available orders sorted by proximity (nearest first)
        ├── Auto-dispatch: ready → nearest idle runner auto-assigned
        ├── Manual claim → assigned → delivering → delivered
        └── Supabase Realtime subscription (venue-scoped)
```

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/venues/[slug]` | Get venue by QR slug |
| GET | `/api/vendors?venue_id=` | List vendors for a venue |
| GET | `/api/menu?vendor_id=` | Get menu items for a vendor |
| POST | `/api/orders/create` | Create order + Stripe session |
| GET | `/api/orders/[id]` | Get order by ID |
| PATCH | `/api/orders/[id]/status` | Update order status (with transition validation + auto-dispatch) |
| POST | `/api/webhooks/stripe` | Handle Stripe payment confirmation |
| GET | `/api/runners/orders` | Get orders for runner dashboard (proximity-sorted) |
| POST | `/api/runners/dispatch` | Auto-assign nearest idle runner to a ready order |

### Order Status Flow

```
pending → accepted → preparing → ready → assigned → delivering → delivered
                                   │         │                        │
                                   │         └── auto-dispatch:       └── runner → idle
                                   │             nearest idle runner
                                   └── (cancelled at any step)
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout with Geist fonts
│   ├── globals.css                 # Tailwind + custom styles
│   ├── order/
│   │   ├── page.tsx                # QR entry point — reads URL params
│   │   ├── OrderFlow.tsx           # Orchestrates venue load → vendor → menu
│   │   ├── VendorList.tsx          # Vendor selection cards
│   │   ├── MenuView.tsx            # Menu items grouped by category
│   │   ├── CartSheet.tsx           # Slide-up cart with checkout
│   │   └── [id]/status/page.tsx    # Real-time order tracking
│   ├── runner/
│   │   ├── login/page.tsx          # Supabase Auth login
│   │   └── dashboard/page.tsx      # Runner order management
│   └── api/
│       ├── venues/[slug]/route.ts
│       ├── vendors/route.ts
│       ├── menu/route.ts
│       ├── orders/create/route.ts
│       ├── orders/[id]/route.ts
│       ├── orders/[id]/status/route.ts
│       ├── runners/orders/route.ts
│       ├── runners/dispatch/route.ts
│       └── webhooks/stripe/route.ts
├── components/
│   ├── Header.tsx                  # Sticky header with branding + cart
│   └── StatusBadge.tsx             # Color-coded order status pill
├── context/
│   └── CartContext.tsx              # Global cart state management
└── lib/
    ├── supabase.ts                 # Supabase client (anon + service role)
    ├── stripe.ts                   # Stripe server client
    ├── dispatch.ts                 # Runner proximity dispatch algorithm
    └── types.ts                    # TypeScript interfaces + pricing logic
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- A Stripe account (test mode)

### 1. Clone & install

```bash
git clone https://github.com/your-username/rowrunner-yconic.git
cd rowrunner-yconic
npm install
```

### 2. Set up Supabase

Run the schema and seed files against your Supabase project:

```bash
# In the Supabase SQL Editor, run in order:
# 1. supabase/schema.sql   — creates all tables, indexes, RLS policies, and Realtime config
# 2. supabase/seed.sql     — inserts RIFC venue, vendors, and menu items
```

Create a runner account in Supabase Auth (email/password), then insert a matching row into the `runners` table with that user's UUID and the RIFC venue ID.

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in your Supabase and Stripe credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — click **Try Demo Order** to simulate a fan scanning a QR code at Section 112, Row H, Seat 14.

### 5. Test the Stripe webhook locally

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Revenue Model

| Fee | Amount | Paid By |
|---|---|---|
| Service fee | 10.5% of subtotal | Fan |
| Delivery fee | $2.00 flat (delivery only) | Fan |
| Venue cost | $0 | — |
| Vendor commission | 0% | — |
| Runner tips | 100% to runner | Fan (optional) |

---

## Built By

**Christopher dos Reis** — University of Rhode Island, Class of 2026

Yconic Hackathon 2026
