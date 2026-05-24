-- 20260523100000_academy_memberships.sql

-- 1. Add pricing and status fields to creator_academies
ALTER TABLE public.creator_academies
ADD COLUMN description TEXT,
ADD COLUMN price_monthly_cents INTEGER DEFAULT 0,
ADD COLUMN price_yearly_cents INTEGER DEFAULT 0,
ADD COLUMN published BOOLEAN DEFAULT false;

-- 2. Create academy_memberships table
CREATE TABLE IF NOT EXISTS public.academy_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    academy_id UUID NOT NULL REFERENCES public.creator_academies(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, academy_id)
);

-- Enable RLS for academy_memberships
ALTER TABLE public.academy_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memberships" 
    ON public.academy_memberships FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Academy creators can view their members" 
    ON public.academy_memberships FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.creator_academies ca
            WHERE ca.id = academy_memberships.academy_id
            AND ca.creator_id = auth.uid()
        )
    );

-- 3. Add academy_id to products
ALTER TABLE public.products
ADD COLUMN academy_id UUID REFERENCES public.creator_academies(id) ON DELETE SET NULL;

-- 4. Update products RLS to allow reading if user is an active member of the academy
DROP POLICY IF EXISTS products_public_read ON public.products;

CREATE POLICY products_public_read ON public.products
  FOR SELECT USING (
    published = true 
    OR 
    (academy_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.academy_memberships am
        WHERE am.academy_id = products.academy_id
        AND am.user_id = auth.uid()
        AND am.status = 'active'
    ))
  );

-- 5. Update lessons RLS to allow reading if user is an active member of the academy
DROP POLICY IF EXISTS lessons_preview_read ON public.lessons;

CREATE POLICY lessons_preview_read ON public.lessons
  FOR SELECT USING (
    is_preview = true
    OR EXISTS (
      SELECT 1 FROM public.purchases p
      JOIN public.modules m ON m.id = lessons.module_id
      WHERE p.user_id = auth.uid()
        AND p.product_id = m.product_id
        AND p.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM public.academy_memberships am
      JOIN public.products p ON p.academy_id = am.academy_id
      JOIN public.modules m ON m.product_id = p.id
      WHERE m.id = lessons.module_id
        AND am.user_id = auth.uid()
        AND am.status = 'active'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_academy_memberships_modtime
    BEFORE UPDATE ON public.academy_memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_academy_updated_at();
