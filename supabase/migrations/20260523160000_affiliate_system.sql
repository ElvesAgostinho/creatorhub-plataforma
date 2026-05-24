-- Migration: Affiliate System

-- 1. Update existing tables
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS affiliate_commission_pct integer DEFAULT 0;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS affiliate_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Affiliate Applications
CREATE TABLE IF NOT EXISTS public.affiliate_applications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    status text NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    application_text text,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);

ALTER TABLE public.affiliate_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own applications" 
    ON public.affiliate_applications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications" 
    ON public.affiliate_applications FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all applications" 
    ON public.affiliate_applications FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 3. Affiliate Links
CREATE TABLE IF NOT EXISTS public.affiliate_links (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_id uuid REFERENCES auth.users(id) NOT NULL,
    product_id uuid REFERENCES public.products(id) NOT NULL,
    code text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(affiliate_id, product_id)
);

ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read affiliate links" 
    ON public.affiliate_links FOR SELECT 
    USING (true);

-- Only approved affiliates can create links.
CREATE POLICY "Approved affiliates can create links" 
    ON public.affiliate_links FOR INSERT 
    WITH CHECK (
        auth.uid() = affiliate_id 
        AND EXISTS (
            SELECT 1 FROM public.affiliate_applications 
            WHERE user_id = auth.uid() AND status = 'approved'
        )
    );

CREATE POLICY "Affiliates can delete their own links" 
    ON public.affiliate_links FOR DELETE 
    USING (auth.uid() = affiliate_id);

-- 4. Affiliate Earnings
CREATE TABLE IF NOT EXISTS public.affiliate_earnings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_id uuid REFERENCES auth.users(id) NOT NULL,
    purchase_id uuid REFERENCES public.purchases(id) NOT NULL,
    amount_cents integer NOT NULL,
    status text NOT NULL DEFAULT 'pending', -- pending, cleared, paid
    created_at timestamp with time zone DEFAULT now(),
    cleared_at timestamp with time zone,
    paid_at timestamp with time zone,
    UNIQUE(purchase_id) -- Only one earning record per purchase
);

ALTER TABLE public.affiliate_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can read their own earnings" 
    ON public.affiliate_earnings FOR SELECT 
    USING (auth.uid() = affiliate_id);

CREATE POLICY "Admins can manage all earnings" 
    ON public.affiliate_earnings FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
