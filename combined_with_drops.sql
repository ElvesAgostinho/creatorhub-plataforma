DROP TABLE IF EXISTS public.admin_settings CASCADE; DROP TABLE IF EXISTS public.product_modules CASCADE; DROP TABLE IF EXISTS public.product_lessons CASCADE; DROP TABLE IF EXISTS public.ebooks CASCADE; DROP TABLE IF EXISTS public.mentorships CASCADE; DROP TABLE IF EXISTS public.services CASCADE; DROP TABLE IF EXISTS public.bookings CASCADE; DROP TABLE IF EXISTS public.courses CASCADE; DROP TABLE IF EXISTS public.modules CASCADE; DROP TABLE IF EXISTS public.lessons CASCADE; DROP TABLE IF EXISTS public.access_control CASCADE; DROP TABLE IF EXISTS public.categories CASCADE; DROP TABLE IF EXISTS public.sellers CASCADE; DROP TABLE IF EXISTS public.products CASCADE; DROP TABLE IF EXISTS public.product_images CASCADE; DROP TABLE IF EXISTS public.orders CASCADE; DROP TABLE IF EXISTS public.coupons CASCADE; DROP TABLE IF EXISTS public.order_items CASCADE; DROP TABLE IF EXISTS public.enrollments CASCADE; DROP TABLE IF EXISTS public.reviews CASCADE; DROP TABLE IF EXISTS public.affiliates CASCADE; DROP TABLE IF EXISTS public.affiliate_links CASCADE; DROP TABLE IF EXISTS public.commissions CASCADE; DROP TABLE IF EXISTS public.notifications CASCADE; DROP TABLE IF EXISTS public.withdrawal_requests CASCADE; DROP TABLE IF EXISTS public.admin_actions CASCADE; DROP TABLE IF EXISTS public.platform_settings CASCADE; DROP TABLE IF EXISTS public.seller_applications CASCADE; DROP TABLE IF EXISTS public.affiliate_applications CASCADE; DROP TABLE IF EXISTS public.mentorship_slots CASCADE; DROP TABLE IF EXISTS public.lesson_progress CASCADE; DROP TABLE IF EXISTS public.purchases CASCADE; DROP TABLE IF EXISTS public.profiles CASCADE;
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
-- =====================================================================
-- CreatorHub — Migration 002: checkout semi-automático + aulas
-- Aplicar em: Supabase Dashboard → SQL Editor → New query → Run
-- =====================================================================

-- ---------- RLS extra ----------
-- Users podem criar a sua própria compra em estado 'pending'
drop policy if exists purchases_self_insert on public.purchases;
create policy purchases_self_insert on public.purchases
  for insert
  with check (auth.uid() = user_id and status = 'pending');

-- Admins podem ler/atualizar todas as purchases via RLS (em complemento ao service_role)
drop policy if exists purchases_admin_read on public.purchases;
create policy purchases_admin_read on public.purchases
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin')
    )
  );

drop policy if exists purchases_admin_update on public.purchases;
create policy purchases_admin_update on public.purchases
  for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin')
    )
  );

-- Admins podem listar todos os profiles (para mostrar email do comprador)
drop policy if exists profiles_admin_read on public.profiles;
create policy profiles_admin_read on public.profiles
  for select
  using (
    exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid() and p2.role = 'admin'
    )
  );

-- ---------- Limpar lições existentes para idempotência do seed ----------
delete from public.modules
where product_id in (
  select id from public.products
  where slug in (
    'design-de-interfaces-modernas',
    'fotografia-profissional-para-instagram',
    'desenho-para-iniciantes-nivel-1'
  )
);

-- ---------- SEED de aulas em 3 cursos ----------
-- URLs de vídeo: amostras MP4 públicas (Google Cloud demo bucket)
-- Em produção: trocar por Mux/Bunny com signed URLs.

-- Curso 1: Design de Interfaces Modernas
with new_module as (
  insert into public.modules (product_id, title, position)
  select id, 'Módulo Único', 1 from public.products where slug = 'design-de-interfaces-modernas'
  returning id
)
insert into public.lessons (module_id, title, description, video_url, duration_seconds, position, is_preview)
select new_module.id, t.title, t.description, t.video_url, t.duration_seconds, t.position, t.is_preview
from new_module
cross join (values
  ('Boas-vindas e ferramentas', 'Visão geral do curso e setup das ferramentas (Figma).', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 596, 1, true),
  ('Fundamentos: cor, tipografia e grelha', 'Princípios base de design visual aplicados a UI.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 654, 2, false),
  ('Componentes e Design System', 'Criar componentes reutilizáveis e tokens.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 614, 3, false),
  ('Prototipagem e handoff', 'Como entregar designs prontos para desenvolvimento.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 596, 4, false)
) as t(title, description, video_url, duration_seconds, position, is_preview);

-- Curso 2: Fotografia Profissional para Instagram
with new_module as (
  insert into public.modules (product_id, title, position)
  select id, 'Módulo Único', 1 from public.products where slug = 'fotografia-profissional-para-instagram'
  returning id
)
insert into public.lessons (module_id, title, description, video_url, duration_seconds, position, is_preview)
select new_module.id, t.title, t.description, t.video_url, t.duration_seconds, t.position, t.is_preview
from new_module
cross join (values
  ('Apresentação', 'O que vais aprender neste curso.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 120, 1, true),
  ('Luz natural e composição', 'Como usar a luz a teu favor.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 480, 2, false),
  ('Edição no telemóvel', 'Apps e workflow para editar rápido.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 540, 3, false)
) as t(title, description, video_url, duration_seconds, position, is_preview);

-- Curso 3: Desenho para Iniciantes
with new_module as (
  insert into public.modules (product_id, title, position)
  select id, 'Módulo Único', 1 from public.products where slug = 'desenho-para-iniciantes-nivel-1'
  returning id
)
insert into public.lessons (module_id, title, description, video_url, duration_seconds, position, is_preview)
select new_module.id, t.title, t.description, t.video_url, t.duration_seconds, t.position, t.is_preview
from new_module
cross join (values
  ('Introdução ao sketchbook', 'O teu primeiro caderno e materiais essenciais.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 360, 1, true),
  ('Linha, forma e proporção', 'Exercícios práticos para ganhar mão.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 540, 2, false),
  ('Estudo de luz e sombra', 'Volume, contraste e profundidade.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 600, 3, false),
  ('Projeto final', 'Aplica tudo numa peça pronta para portefólio.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', 720, 4, false)
) as t(title, description, video_url, duration_seconds, position, is_preview);

-- =====================================================================
-- COMO TE TORNARES ADMIN
-- Depois de fazeres signup na app:
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'TEU_EMAIL@aqui.com');
-- =====================================================================
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

