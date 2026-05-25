-- Migration: Add manual approval flow
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected'));

-- Update existing users to 'active' so they don't get locked out
UPDATE public.profiles SET status = 'active';

-- Recreate the trigger function to insert new users as 'pending'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, status)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'pending'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;
