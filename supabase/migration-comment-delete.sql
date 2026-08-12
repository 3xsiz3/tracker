-- Миграция для уже развёрнутой базы: разрешает автору удалять свой комментарий.
-- Выполнить один раз: Supabase Dashboard -> SQL Editor -> New query -> вставить целиком -> Run.

create policy "comments_delete_own" on public.comments for delete to authenticated
  using ("authorId" = auth.uid());
