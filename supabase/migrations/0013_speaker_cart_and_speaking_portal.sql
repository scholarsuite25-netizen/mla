-- Migration 0013: Multi-item Cart, Speaking Inquiries & Sample Previews

-- 1. Order Items Table for Multi-item Shopping Cart
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.digital_products(id) on delete set null,
  bundle_id uuid references public.product_bundles(id) on delete set null,
  title text not null,
  unit_price numeric(12, 2) not null default 0,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);

-- 2. Speaking Inquiries Table for Keynotes & Corporate Advisory
create table if not exists public.speaking_inquiries (
  id uuid primary key default gen_random_uuid(),
  organizer_name text not null,
  organization text not null,
  email text not null,
  phone text,
  event_type text not null default 'Keynote' check (event_type in ('Keynote', 'Corporate Training', 'Executive Retreat', 'Panel / Conference', 'VIP Advisory')),
  event_date text,
  location text,
  estimated_attendees text,
  budget_range text,
  message text not null default '',
  status text not null default 'pending' check (status in ('pending', 'contacted', 'confirmed', 'declined')),
  created_at timestamptz not null default now()
);

-- 3. Enhance digital_products for Sample Previews
alter table public.digital_products add column if not exists preview_excerpt_text text;
alter table public.digital_products add column if not exists table_of_contents jsonb default '[]'::jsonb;
alter table public.digital_products add column if not exists sample_audio_url text;

-- 4. Enable Row Level Security (RLS)
alter table public.order_items enable row level security;
alter table public.speaking_inquiries enable row level security;

-- Policies for order_items
create policy "Order items are viewable by buyer or admin" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and (orders.buyer_id = auth.uid() or exists (
        select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'super_admin'
      ))
    )
  );

create policy "Super admin can manage order items" on public.order_items
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'super_admin'
    )
  );

-- Public can submit speaking inquiries
create policy "Anyone can submit speaking inquiries" on public.speaking_inquiries
  for insert with check (true);

-- Super admin can view and manage speaking inquiries
create policy "Super admin can manage speaking inquiries" on public.speaking_inquiries
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'super_admin'
    )
  );
