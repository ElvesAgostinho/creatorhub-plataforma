-- Add explicit foreign keys to the profiles table so PostgREST can do automatic joins

ALTER TABLE public.products
  ADD CONSTRAINT products_created_by_profiles_fk 
  FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE public.purchases
  ADD CONSTRAINT purchases_user_id_profiles_fk 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id);
