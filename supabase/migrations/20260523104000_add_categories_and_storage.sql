-- 20260523104000_add_categories_and_storage.sql

-- 1. ADICIONAR COLUNAS DE CATEGORIA AOS PRODUTOS E RECURSOS
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory TEXT;

ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- 2. CRIAR BUCKET DE UPLOADS (Se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- 3. CRIAR POLÍTICAS DE ACESSO AO STORAGE
-- Drop existing policies if they exist to avoid errors
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;

-- Select (Leitura) pública para qualquer ficheiro no bucket 'uploads'
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploads');

-- Insert, Update, Delete apenas para utilizadores autenticados
CREATE POLICY "Auth Insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Auth Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads');

CREATE POLICY "Auth Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads');
