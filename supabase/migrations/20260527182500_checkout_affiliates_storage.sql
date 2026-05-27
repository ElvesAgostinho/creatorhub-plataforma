-- Migration: Checkout, Affiliates and Storage
-- Description: Adds columns to support Hotmart-style checkout, advanced affiliate tracking, and tiered storage pricing.

-- 1. Updates to Products for Checkout Page
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS advantages text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS target_audience text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS external_sales_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS creator_social_links jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS has_internal_storage boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS promo_video_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS promo_media_source text DEFAULT 'internal' CHECK (promo_media_source IN ('internal', 'youtube', 'vimeo', 'google_drive', 'external_link'));

-- 2. Updates to Lessons for External Media
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS media_source text DEFAULT 'internal' CHECK (media_source IN ('internal', 'youtube', 'vimeo', 'google_drive', 'external_link'));
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS external_media_url text;

-- 3. Updates to Affiliate Links for multiple destinations
ALTER TABLE public.affiliate_links ADD COLUMN IF NOT EXISTS destination_type text DEFAULT 'product_page' CHECK (destination_type IN ('product_page', 'direct_checkout', 'creator_external_site', 'creator_social'));
ALTER TABLE public.affiliate_links ADD COLUMN IF NOT EXISTS destination_url text;

-- 4. Creator Storage Billing Table
CREATE TABLE IF NOT EXISTS public.creator_storage_billing (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'past_due')),
    monthly_fee_cents integer NOT NULL DEFAULT 2000000, -- 20.000 AOA (represented in cents/cents-equivalent depending on currency logic, assume 100 multiplier)
    next_billing_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.creator_storage_billing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view their own billing" 
    ON public.creator_storage_billing FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all storage billings" 
    ON public.creator_storage_billing FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
