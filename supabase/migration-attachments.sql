-- Миграция для уже развёрнутой базы: добавляет вложения к комментариям.
-- Выполнить один раз: Supabase Dashboard -> SQL Editor -> New query -> вставить целиком -> Run.
--
-- История изменений задач (task.history) для новой колонки "какое условие выполнено"
-- миграции не требует — это jsonb, новые поля пишутся туда без изменения схемы.

alter table public.comments add column if not exists attachments jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

create policy "attachments_select_authenticated" on storage.objects for select to authenticated
  using (bucket_id = 'attachments');
create policy "attachments_insert_authenticated" on storage.objects for insert to authenticated
  with check (bucket_id = 'attachments');
create policy "attachments_delete_authenticated" on storage.objects for delete to authenticated
  using (bucket_id = 'attachments');
