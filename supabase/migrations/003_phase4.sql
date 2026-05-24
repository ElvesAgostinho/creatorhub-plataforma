-- =====================================================================
-- CreatorHub — Migration 003: Storage, mentorias, eventos, livros
-- Aplicar em: Supabase Dashboard → SQL Editor → New query → Run
-- =====================================================================

-- ---------- Novas colunas em products ----------
alter table public.products
  add column if not exists file_path text,
  add column if not exists event_starts_at timestamptz,
  add column if not exists event_meeting_url text;

-- ---------- Mentorship slots ----------
create table if not exists public.mentorship_slots (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  starts_at timestamptz not null,
  duration_minutes integer not null default 60,
  status text not null default 'available'
    check (status in ('available','booked','completed','cancelled')),
  meeting_url text,
  created_at timestamptz not null default now()
);
create index if not exists mentorship_slots_product_idx on public.mentorship_slots(product_id);
create index if not exists mentorship_slots_status_idx on public.mentorship_slots(status);

-- ---------- Bookings ----------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  slot_id uuid not null references public.mentorship_slots(id) on delete cascade,
  status text not null default 'confirmed'
    check (status in ('confirmed','cancelled','completed')),
  meeting_url text,
  created_at timestamptz not null default now(),
  unique (slot_id)
);
create index if not exists bookings_user_idx on public.bookings(user_id);

-- ---------- RLS ----------
alter table public.mentorship_slots enable row level security;
alter table public.bookings enable row level security;

drop policy if exists slots_public_read on public.mentorship_slots;
create policy slots_public_read on public.mentorship_slots
  for select using (true);

drop policy if exists slots_admin_manage on public.mentorship_slots;
create policy slots_admin_manage on public.mentorship_slots
  for all using (
    exists (select 1 from public.profiles
            where id = auth.uid() and role = 'admin')
  );

drop policy if exists bookings_self_read on public.bookings;
create policy bookings_self_read on public.bookings
  for select using (auth.uid() = user_id);

drop policy if exists bookings_admin_read on public.bookings;
create policy bookings_admin_read on public.bookings
  for select using (
    exists (select 1 from public.profiles
            where id = auth.uid() and role = 'admin')
  );

-- =====================================================================
-- STORAGE — buckets privados (books, lessons) e público (images)
-- =====================================================================
insert into storage.buckets (id, name, public) values ('lessons', 'lessons', false)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public) values ('books', 'books', false)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public) values ('images', 'images', true)
on conflict (id) do update set public = excluded.public;

-- Public read no bucket de imagens
drop policy if exists storage_images_public_read on storage.objects;
create policy storage_images_public_read on storage.objects
  for select using (bucket_id = 'images');

-- Nota: uploads e downloads de lessons/books são feitos via service_role
-- a partir de server actions / API routes, por isso não precisamos de
-- RLS extra nesses buckets. A verificação de acesso fica na app.
