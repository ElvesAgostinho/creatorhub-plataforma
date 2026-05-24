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
