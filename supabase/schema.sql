-- RowRunner: In-Seat Stadium Ordering Platform
-- Database Schema for Supabase (PostgreSQL)

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- VENUES
-- ============================================================
create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- VENDORS (concession stands inside a venue)
-- ============================================================
create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  name text not null,
  description text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- MENU ITEMS
-- ============================================================
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  name text not null,
  description text not null default '',
  price numeric(8,2) not null,
  category text not null check (category in ('food','drink','alcohol','merch')),
  available boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- RUNNERS
-- ============================================================
create table public.runners (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  venue_id uuid not null references public.venues(id) on delete cascade,
  current_section text,
  status text not null default 'idle' check (status in ('idle','busy')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- ORDERS
-- ============================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id),
  vendor_id uuid not null references public.vendors(id),
  runner_id uuid references public.runners(id),
  seat_section text not null,
  seat_row text not null,
  seat_number text not null,
  subtotal numeric(8,2) not null,
  service_fee numeric(8,2) not null,
  delivery_fee numeric(8,2) not null default 0,
  total numeric(8,2) not null,
  tip_percent integer default 0,
  tip_amount numeric(8,2) not null default 0,
  status text not null default 'pending'
    check (status in ('pending','accepted','preparing','ready','assigned','delivering','delivered','cancelled')),
  type text not null default 'delivery' check (type in ('delivery','pickup')),
  stripe_session_id text unique,
  customer_name text,
  customer_phone text,
  customer_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id),
  name text not null,
  price numeric(8,2) not null,
  quantity integer not null default 1
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_vendors_venue on public.vendors(venue_id);
create index idx_menu_items_vendor on public.menu_items(vendor_id);
create index idx_orders_venue on public.orders(venue_id);
create index idx_orders_runner on public.orders(runner_id);
create index idx_orders_status on public.orders(status);
create index idx_order_items_order on public.order_items(order_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Venues: anyone can read active venues
alter table public.venues enable row level security;
create policy "Venues are publicly readable"
  on public.venues for select
  using (true);

-- Vendors: anyone can read active vendors
alter table public.vendors enable row level security;
create policy "Vendors are publicly readable"
  on public.vendors for select
  using (true);

-- Menu items: anyone can read available items
alter table public.menu_items enable row level security;
create policy "Menu items are publicly readable"
  on public.menu_items for select
  using (true);

-- Runners: runners can read their own record
alter table public.runners enable row level security;
create policy "Runners can read own record"
  on public.runners for select
  using (auth.uid() = id);

-- Orders: public read (fans track via direct link), service role handles writes
alter table public.orders enable row level security;
create policy "Orders are readable by everyone"
  on public.orders for select
  using (true);
create policy "Service role manages orders"
  on public.orders for all
  using (auth.role() = 'service_role');

-- Order items: public read, service role handles writes
alter table public.order_items enable row level security;
create policy "Order items are readable by everyone"
  on public.order_items for select
  using (true);
create policy "Service role manages order items"
  on public.order_items for all
  using (auth.role() = 'service_role');

-- ============================================================
-- REALTIME — enable for orders table (fan status tracking + runner dashboard)
-- ============================================================
alter publication supabase_realtime add table public.orders;
