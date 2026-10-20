-- Migration 0012: Speaker Ecommerce Enhancements
-- Adds product bundles, coupons, store settings (bank & WhatsApp), and guest/direct bank transfer order fields.

-- 1. Store settings (for Company Bank Account & WhatsApp sales line)
create table if not exists public.store_settings (
  id text primary key default 'default',
  company_bank_name text not null default 'Zenith Bank',
  company_account_number text not null default '1012345678',
  company_account_name text not null default 'Company Account',
  whatsapp_number text not null default '2348000000000',
  whatsapp_instructions text not null default 'Transfer the exact amount to the bank account above and click the button to send your receipt on WhatsApp for instant confirmation.',
  updated_at timestamptz not null default now()
);

-- Seed default settings if empty
insert into public.store_settings (id, company_bank_name, company_account_number, company_account_name, whatsapp_number)
values ('default', 'Zenith Bank', '1012345678', 'Public Speaker Media Ltd', '2348000000000')
on conflict (id) do nothing;

-- 2. Coupons Table
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null default 'percent' check (discount_type in ('percent', 'fixed')),
  discount_value numeric(12, 2) not null check (discount_value > 0),
  min_spend numeric(12, 2) not null default 0,
  max_uses integer default null,
  used_count integer not null default 0,
  valid_until timestamptz default null,
  is_active boolean not null default true,
  event_tag text default null,
  created_at timestamptz not null default now()
);

create index if not exists idx_coupons_code on public.coupons (code);

-- 3. Product Bundles Table
create table if not exists public.product_bundles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text,
  description text not null default '',
  price numeric(12, 2) not null default 0 check (price >= 0),
  original_price numeric(12, 2) default 0,
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Junction table linking bundles to digital products
create table if not exists public.product_bundle_items (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid not null references public.product_bundles(id) on delete cascade,
  product_id uuid not null references public.digital_products(id) on delete cascade,
  unique (bundle_id, product_id)
);

create index if not exists idx_bundle_items_bundle on public.product_bundle_items(bundle_id);
create index if not exists idx_bundle_items_product on public.product_bundle_items(product_id);

-- 4. Enhance orders table to support bundles, coupons, guest checkout, and direct bank transfer
alter table public.orders alter column buyer_id drop not null;
alter table public.orders alter column product_id drop not null;

alter table public.orders add column if not exists buyer_email text;
alter table public.orders add column if not exists buyer_name text;
alter table public.orders add column if not exists bundle_id uuid references public.product_bundles(id) on delete set null;
alter table public.orders add column if not exists payment_method text not null default 'paystack';
alter table public.orders add column if not exists coupon_id uuid references public.coupons(id) on delete set null;
alter table public.orders add column if not exists discount_amount numeric(12, 2) not null default 0;
alter table public.orders add column if not exists transfer_reference text;
alter table public.orders add column if not exists transfer_proof_note text;

create index if not exists idx_orders_payment_method on public.orders(payment_method);
create index if not exists idx_orders_buyer_email on public.orders(buyer_email);

-- 5. Enhance product_licenses to support guest buyers and bundle items
alter table public.product_licenses alter column buyer_id drop not null;
alter table public.product_licenses add column if not exists buyer_email text;
alter table public.product_licenses add column if not exists bundle_id uuid references public.product_bundles(id) on delete set null;

create index if not exists idx_product_licenses_buyer_email on public.product_licenses(buyer_email);

-- 6. Enable Row Level Security (RLS) on new tables
alter table public.store_settings enable row level security;
alter table public.coupons enable row level security;
alter table public.product_bundles enable row level security;
alter table public.product_bundle_items enable row level security;

-- Public can read store settings
create policy "Store settings are viewable by everyone" on public.store_settings
  for select using (true);

-- Public can view active coupons
create policy "Active coupons are viewable by everyone" on public.coupons
  for select using (is_active = true);

-- Public can view published bundles
create policy "Published bundles are viewable by everyone" on public.product_bundles
  for select using (status = 'published');

-- Public can view bundle items for published bundles
create policy "Bundle items are viewable by everyone" on public.product_bundle_items
  for select using (
    exists (
      select 1 from public.product_bundles
      where product_bundles.id = product_bundle_items.bundle_id
      and product_bundles.status = 'published'
    )
  );

-- Super admin policies for managing store_settings, coupons, bundles
create policy "Super admin can manage store settings" on public.store_settings
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'super_admin'
    )
  );

create policy "Super admin can manage coupons" on public.coupons
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'super_admin'
    )
  );

create policy "Super admin can manage product bundles" on public.product_bundles
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'super_admin'
    )
  );

create policy "Super admin can manage bundle items" on public.product_bundle_items
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'super_admin'
    )
  );
