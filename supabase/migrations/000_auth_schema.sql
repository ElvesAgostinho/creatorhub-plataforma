-- Migration: Esquema de autenticação próprio
-- Descrição: substitui o GoTrue da Supabase por tabelas nossas.
--
-- O nome começa em 000 de propósito: as migrations correm por ordem alfabética
-- e todas as outras — as 14 — referenciam auth.users(id). Mantendo o mesmo
-- esquema e o mesmo nome de tabela, nenhuma delas precisa de ser alterada.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS auth;

-- =====================================================================
-- UTILIZADORES
-- Colunas com os mesmos nomes que o GoTrue usava, porque o trigger
-- handle_new_user() em 001_init.sql lê new.email e new.raw_user_meta_data.
-- =====================================================================
CREATE TABLE IF NOT EXISTS auth.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    encrypted_password text,
    email_confirmed_at timestamptz,
    raw_user_meta_data jsonb NOT NULL DEFAULT '{}'::jsonb,
    last_sign_in_at timestamptz,
    banned_until timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Email único sem distinguir maiúsculas, sem precisar da extensão citext
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unico ON auth.users (lower(email));

-- =====================================================================
-- SESSÕES
-- Guardadas para se poderem revogar. O cookie leva um token assinado; esta
-- tabela é o que permite terminar sessão num dispositivo ou suspender alguém
-- sem esperar que o token expire.
-- =====================================================================
CREATE TABLE IF NOT EXISTS auth.sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    last_seen_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz,
    user_agent text,
    ip text
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON auth.sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expira_idx ON auth.sessions(expires_at) WHERE revoked_at IS NULL;

-- =====================================================================
-- FICHAS DE UTILIZAÇÃO ÚNICA
-- Confirmação de email e reposição de palavra-passe. Guarda-se o resumo,
-- nunca a ficha em si: quem tiver acesso à base de dados não consegue
-- usá-las para entrar na conta de ninguém.
-- =====================================================================
CREATE TABLE IF NOT EXISTS auth.one_time_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash text NOT NULL UNIQUE,
    tipo text NOT NULL CHECK (tipo IN ('confirmacao_email', 'reposicao_password')),
    expires_at timestamptz NOT NULL,
    used_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS one_time_tokens_user_idx ON auth.one_time_tokens(user_id, tipo);

-- =====================================================================
-- auth.uid()
-- As políticas de RLS das migrations seguintes chamam esta função, por isso
-- ela tem de existir ou o CREATE POLICY falha.
--
-- Nota importante: a aplicação liga-se como dona das tabelas, e nesse caso o
-- Postgres não aplica RLS. A autorização passou a viver na aplicação, em
-- lib/auth. As políticas ficam como documentação da intenção.
-- =====================================================================
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')::uuid
$$;

-- =====================================================================
-- REGISTO DE AÇÕES DE ADMINISTRAÇÃO
-- Quem fez o quê, a partir do painel. Substitui a auditoria que o painel da
-- Supabase dava de borla.
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_email text,
    accao text NOT NULL,
    alvo_tipo text,
    alvo_id text,
    detalhes jsonb NOT NULL DEFAULT '{}'::jsonb,
    ip text,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_audit_created_idx ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_actor_idx ON public.admin_audit_log(actor_id);
