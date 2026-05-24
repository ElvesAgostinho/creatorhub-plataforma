-- create_creator_academies.sql

CREATE TABLE IF NOT EXISTS public.creator_academies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Minha Academia',
    slug TEXT UNIQUE,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#FF4500',
    hero_image_url TEXT,
    hero_video_url TEXT,
    faqs JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '{"gamification": true, "community": false}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(creator_id)
);

-- Enable RLS
ALTER TABLE public.creator_academies ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view academies" 
    ON public.creator_academies FOR SELECT 
    USING (true);

CREATE POLICY "Creators can insert their own academy" 
    ON public.creator_academies FOR INSERT 
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own academy" 
    ON public.creator_academies FOR UPDATE 
    USING (auth.uid() = creator_id);

-- Create a trigger for updated_at
CREATE OR REPLACE FUNCTION update_academy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_creator_academies_modtime
    BEFORE UPDATE ON public.creator_academies
    FOR EACH ROW
    EXECUTE FUNCTION update_academy_updated_at();
