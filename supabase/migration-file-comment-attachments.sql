-- Миграция для уже развёрнутой базы: вложения в обсуждении файлов.
-- Выполнить один раз: Supabase Dashboard -> SQL Editor -> New query -> вставить целиком -> Run.

alter table public.file_comments add column if not exists attachments jsonb not null default '[]'::jsonb;
