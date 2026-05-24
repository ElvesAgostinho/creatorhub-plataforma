-- Script para ativar permissões de Upload via Cliente (TUS / supabase-js)
-- Executa este script no SQL Editor do Supabase

-- Permite uploads no bucket 'images' para utilizadores autenticados
CREATE POLICY "Permitir upload de imagens para utilizadores autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Permite uploads no bucket 'books' para utilizadores autenticados
CREATE POLICY "Permitir upload de livros para utilizadores autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'books');

-- Permite uploads (e TUS resumable) no bucket 'lessons' para utilizadores autenticados
CREATE POLICY "Permitir upload de vídeos para utilizadores autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lessons');

-- Atualização de ficheiros existentes nos buckets (opcional, mas necessário se quiserem substituir)
CREATE POLICY "Permitir update de imagens"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images');

CREATE POLICY "Permitir update de livros"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'books');

CREATE POLICY "Permitir update de vídeos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'lessons');
