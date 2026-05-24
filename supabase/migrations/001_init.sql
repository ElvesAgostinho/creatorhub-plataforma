-- =====================================================================
-- CreatorHub — Migration 001: schema inicial (wipe + create + RLS + seed)
-- Aplicar em: Supabase Dashboard → SQL Editor → New query → Run
-- =====================================================================

-- ---------- WIPE ----------
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop table if exists public.lesson_progress cascade;
drop table if exists public.purchases cascade;
drop table if exists public.lessons cascade;
drop table if exists public.modules cascade;
drop table if exists public.products cascade;
drop table if exists public.profiles cascade;

-- ---------- EXTENSIONS ----------
create extension if not exists "pgcrypto";

-- ---------- PROFILES ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'student' check (role in ('student','creator','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- PRODUCTS ----------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  type text not null check (type in ('course','book','mentorship','event')),
  title text not null,
  description text,
  image_url text,
  instructor_name text,
  instructor_role text,
  price_cents integer not null default 0,
  original_price_cents integer not null default 0,
  discount_pct integer not null default 0,
  level text check (level in ('iniciante','intermediario','avancado')),
  best_seller boolean not null default false,
  students_count integer not null default 0,
  reviews_positive_pct integer not null default 99,
  reviews_count text not null default '0',
  published boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index products_type_idx on public.products(type);
create index products_published_idx on public.products(published);
create index products_best_seller_idx on public.products(best_seller);

-- ---------- MODULES (apenas relevante para cursos) ----------
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index modules_product_idx on public.modules(product_id);

-- ---------- LESSONS ----------
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  duration_seconds integer not null default 0,
  position integer not null default 0,
  is_preview boolean not null default false,
  created_at timestamptz not null default now()
);
create index lessons_module_idx on public.lessons(module_id);

-- ---------- PURCHASES / ENTITLEMENTS ----------
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','active','refunded','cancelled')),
  amount_cents integer not null default 0,
  currency text not null default 'AOA',
  payment_method text,
  payment_ref text,
  granted_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index purchases_user_idx on public.purchases(user_id);
create index purchases_status_idx on public.purchases(status);

-- ---------- LESSON PROGRESS ----------
create table public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  watched_seconds integer not null default 0,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- =====================================================================
-- RLS POLICIES
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.purchases enable row level security;
alter table public.lesson_progress enable row level security;

-- profiles: cada user lê o seu próprio; pode atualizar o seu próprio
create policy profiles_self_read on public.profiles
  for select using (auth.uid() = id);
create policy profiles_self_update on public.profiles
  for update using (auth.uid() = id);

-- products: qualquer pessoa lê publicados; creators podem gerir os próprios
create policy products_public_read on public.products
  for select using (published = true);
create policy products_owner_manage on public.products
  for all using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

-- modules: qualquer pessoa lê
create policy modules_public_read on public.modules
  for select using (true);

-- lessons: previews públicas; restantes só se tiver compra ativa para o produto
create policy lessons_preview_read on public.lessons
  for select using (
    is_preview = true
    or exists (
      select 1 from public.purchases p
      join public.modules m on m.id = lessons.module_id
      where p.user_id = auth.uid()
        and p.product_id = m.product_id
        and p.status = 'active'
    )
  );

-- purchases: cada user lê só as suas
create policy purchases_self_read on public.purchases
  for select using (auth.uid() = user_id);
-- inserts/updates de purchases ficam por conta do service_role (webhook de pagamento)

-- lesson_progress: cada user lê/escreve só o seu
create policy progress_self_read on public.lesson_progress
  for select using (auth.uid() = user_id);
create policy progress_self_write on public.lesson_progress
  for insert with check (auth.uid() = user_id);
create policy progress_self_update on public.lesson_progress
  for update using (auth.uid() = user_id);

-- =====================================================================
-- SEED — 12 produtos
-- =====================================================================
insert into public.products
  (slug, type, title, description, image_url, instructor_name, instructor_role,
   price_cents, original_price_cents, discount_pct, best_seller,
   students_count, reviews_positive_pct, reviews_count)
values
('design-de-interfaces-modernas','course','Design de Interfaces Modernas',
 'Aprende a criar interfaces digitais limpas, acessíveis e com identidade visual.',
 'https://images.unsplash.com/photo-1561070791-2526d30994b8?w=900&h=560&fit=crop&auto=format',
 'Mina Barrio','Product Designer',
 59000, 3099000, 98, true, 12340, 99, '10.2K'),

('branding-completo-guia-visual','book','Branding Completo — Guia Visual',
 'PDF prático com 180 páginas sobre construir marca do zero.',
 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=900&h=560&fit=crop&auto=format',
 'Ana Victoria Calderón','Designer & Autor',
 200000, 699000, 70, true, 8420, 98, '4.5K'),

('mentoria-1-1-com-designer-senior','mentorship','Mentoria 1:1 com Designer Senior',
 '4 sessões personalizadas para acelerar o teu portefólio.',
 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&h=560&fit=crop&auto=format',
 'Puño','Director Criativo',
 1500000, 2000000, 25, false, 240, 100, '120'),

('workshop-criativo-online','event','Workshop Criativo Online',
 'Workshop ao vivo de 3 horas com exercícios práticos.',
 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=560&fit=crop&auto=format',
 'Mina Barrio','Product Photographer',
 800000, 1600000, 50, false, 1820, 97, '320'),

('fotografia-profissional-para-instagram','course','Fotografia Profissional para Instagram',
 'Truques para tirar e editar fotos de social media só com o telemóvel.',
 'https://images.unsplash.com/photo-1606830733744-0ad778449672?w=900&h=560&fit=crop&auto=format',
 'Mina Barrio','Product Photographer',
 59000, 3099000, 98, true, 283340, 99, '11K'),

('aguarela-moderna-tecnicas','course','Aguarela Moderna — Técnicas',
 'Pinta com aguarelas de forma técnica e criativa.',
 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&h=560&fit=crop&auto=format',
 'Ana Victoria Calderón','Watercolor Artist',
 59000, 3099000, 98, true, 229106, 99, '10.2K'),

('desenho-para-iniciantes-nivel-1','course','Desenho para Iniciantes — Nível 1',
 'Cria o teu primeiro sketchbook com técnicas básicas.',
 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&h=560&fit=crop&auto=format',
 'Puño','Ilustrador',
 59000, 3099000, 98, true, 274651, 99, '10.4K'),

('ilustracao-criativa-avancado','course','Ilustração Criativa — Avançado',
 'Reconecta-te com a criatividade e melhora o teu desenho.',
 'https://images.unsplash.com/photo-1626785774573-ab3f1cc0fce3?w=900&h=560&fit=crop&auto=format',
 'Puño','Ilustrador',
 59000, 3099000, 98, true, 178152, 99, '4.5K'),

('manual-de-tipografia-pdf','book','Manual de Tipografia (PDF)',
 'Guia visual de fontes, hierarquia e escolhas tipográficas.',
 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&h=560&fit=crop&auto=format',
 'Equipa CreatorHub','Coletivo',
 200000, 500000, 60, false, 3200, 96, '210'),

('mentoria-de-carreira-criativa','mentorship','Mentoria de Carreira Criativa',
 'Plano personalizado para evoluíres na carreira de design.',
 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&h=560&fit=crop&auto=format',
 'Ana Victoria Calderón','Mentora',
 2000000, 2500000, 20, false, 86, 100, '45'),

('encontro-criadores-ao-vivo','event','Encontro Criadores ao Vivo',
 'Sessão ao vivo com convidados especiais e Q&A.',
 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=900&h=560&fit=crop&auto=format',
 'CreatorHub Live','Comunidade',
 500000, 500000, 0, false, 540, 95, '80'),

('especializacao-em-design-grafico','course','Especialização em Design Gráfico',
 'Master em design gráfico: cor, composição e comunicação visual.',
 'https://images.unsplash.com/photo-1561070791-2526d30994b8?w=900&h=560&fit=crop&auto=format',
 'Coletivo Domestika','Masters',
 59000, 9599000, 99, true, 27676, 99, '353');
