-- Migration: Tabelas em falta
-- Descrição: as 10 tabelas que a aplicação usa mas que nunca chegaram a ser
-- versionadas — tinham sido criadas à mão no editor SQL do painel e
-- desapareceram com o projeto. As colunas foram reconstruídas a partir de cada
-- .select(), .insert(), .update() e .eq() do código.

-- =====================================================================
-- 1. CANDIDATURAS A CRIADOR  (/become-creator, /admin/creators)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.creator_applications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bio text,
    portfolio_url text,
    payment_proof_url text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS creator_applications_user_idx ON public.creator_applications(user_id);
CREATE INDEX IF NOT EXISTS creator_applications_status_idx ON public.creator_applications(status);

ALTER TABLE public.creator_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizador vê a sua candidatura"
    ON public.creator_applications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Utilizador cria a sua candidatura"
    ON public.creator_applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin gere todas as candidaturas"
    ON public.creator_applications FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- =====================================================================
-- 2. MENSAGENS / CAIXA DE ENTRADA  (/inbox, /admin/broadcasts)
--    recipient_id NULL = aviso geral a todos os utilizadores
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    subject text,
    content text NOT NULL,
    is_read boolean NOT NULL DEFAULT false,
    lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_recipient_idx ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS messages_unread_idx ON public.messages(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS messages_created_idx ON public.messages(created_at DESC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Destinatário lê as suas mensagens e os avisos gerais"
    ON public.messages FOR SELECT
    USING (recipient_id = auth.uid() OR recipient_id IS NULL);

CREATE POLICY "Remetente envia mensagens"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Destinatário marca como lida"
    ON public.messages FOR UPDATE
    USING (recipient_id = auth.uid());

-- =====================================================================
-- 3. AVALIAÇÕES DE PRODUTO  (/product/[slug])
--    UNIQUE porque o código grava com onConflict 'product_id,user_id'
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (product_id, user_id)
);
CREATE INDEX IF NOT EXISTS product_reviews_product_idx ON public.product_reviews(product_id);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Avaliações são públicas"
    ON public.product_reviews FOR SELECT
    USING (true);

CREATE POLICY "Utilizador gere a sua avaliação"
    ON public.product_reviews FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =====================================================================
-- 4. DEFINIÇÕES DA PLATAFORMA  (/admin/settings, checkout, become-creator)
--    Linha única com id = 'default'
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    id text PRIMARY KEY DEFAULT 'default',
    creator_fee_cents integer NOT NULL DEFAULT 0,
    creator_commission_pct integer NOT NULL DEFAULT 70 CHECK (creator_commission_pct BETWEEN 0 AND 100),
    bank_details text,
    platform_iban text,
    platform_beneficiary text,
    updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Definições são legíveis por todos"
    ON public.site_settings FOR SELECT
    USING (true);

CREATE POLICY "Só o admin altera as definições"
    ON public.site_settings FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- =====================================================================
-- 5. INTEGRAÇÕES DO CRIADOR  (/admin/integrations, webhooks de compra)
--    UNIQUE porque o código grava com onConflict 'creator_id, provider'
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.creator_integrations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider text NOT NULL,
    webhook_url text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (creator_id, provider)
);
CREATE INDEX IF NOT EXISTS creator_integrations_creator_idx ON public.creator_integrations(creator_id);

ALTER TABLE public.creator_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Criador gere as suas integrações"
    ON public.creator_integrations FOR ALL
    USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

-- =====================================================================
-- 6. DESTAQUES DO MARKETPLACE  (/admin/campaigns, lib/data/products)
--    UNIQUE em product_id por causa do onConflict 'product_id'
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.hero_highlights (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
    priority_weight integer NOT NULL DEFAULT 0,
    impressions_limit integer,
    impressions_count integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hero_highlights_active_idx ON public.hero_highlights(is_active, priority_weight DESC);

ALTER TABLE public.hero_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Destaques ativos são públicos"
    ON public.hero_highlights FOR SELECT
    USING (true);

CREATE POLICY "Só o admin gere destaques"
    ON public.hero_highlights FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- =====================================================================
-- 7. CAMPANHAS DE EMAIL  (/admin/campaigns)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    subject text,
    html_body text,
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
    sent_count integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS marketing_campaigns_created_idx ON public.marketing_campaigns(created_at DESC);

ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Só o admin vê e gere campanhas"
    ON public.marketing_campaigns FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- =====================================================================
-- 8. PUBLICAÇÕES DO CLUBE  (/club/[slug])
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.academy_posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    academy_id uuid NOT NULL REFERENCES public.creator_academies(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    thumbnail_url text,
    media_url text,
    is_exclusive boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS academy_posts_academy_idx ON public.academy_posts(academy_id, created_at DESC);

ALTER TABLE public.academy_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Membros da academia veem as publicações"
    ON public.academy_posts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.academy_memberships m
            WHERE m.academy_id = academy_posts.academy_id AND m.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.creator_academies a
            WHERE a.id = academy_posts.academy_id AND a.creator_id = auth.uid()
        )
    );

CREATE POLICY "Criador gere as publicações da sua academia"
    ON public.academy_posts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.creator_academies a
            WHERE a.id = academy_posts.academy_id AND a.creator_id = auth.uid()
        )
    );

-- =====================================================================
-- 9. CLIQUES DE AFILIADO  (/api/track-click)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    url text,
    ip text,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS affiliate_clicks_affiliate_idx ON public.affiliate_clicks(affiliate_id, created_at DESC);

ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Afiliado vê os seus cliques"
    ON public.affiliate_clicks FOR SELECT
    USING (auth.uid() = affiliate_id);

-- O registo de cliques é feito pelo servidor com a service_role, que ignora RLS.

-- =====================================================================
-- 10. REGISTO DE XP  (/learn/[slug])
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.user_xp_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    academy_id uuid REFERENCES public.creator_academies(id) ON DELETE SET NULL,
    xp_amount integer NOT NULL DEFAULT 0,
    action_type text,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS user_xp_logs_user_idx ON public.user_xp_logs(user_id, created_at DESC);

ALTER TABLE public.user_xp_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizador vê o seu XP"
    ON public.user_xp_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Utilizador regista o seu XP"
    ON public.user_xp_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================================
-- 11. Cor por omissão das academias
--     Estava no laranja antigo (#FF4500); passa ao índigo da marca.
--     Só altera o valor por omissão e as academias que nunca o mudaram.
-- =====================================================================
ALTER TABLE public.creator_academies ALTER COLUMN primary_color SET DEFAULT '#4F46E5';
UPDATE public.creator_academies SET primary_color = '#4F46E5' WHERE primary_color = '#FF4500';
