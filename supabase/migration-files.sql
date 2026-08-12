-- Миграция для уже развёрнутой базы: общая библиотека файлов проекта (вкладка «Файлы»).
-- Выполнить один раз: Supabase Dashboard -> SQL Editor -> New query -> вставить целиком -> Run.
--
-- "visibleTo" — пустой массив = видно всем; непустой = видно только перечисленным
-- id пользователей (плюс всегда — автору файла и любому руководителю).

create table public.files (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  path text not null,
  size bigint not null,
  type text not null default '',
  note text not null default '',
  "uploadedById" uuid not null references public.profiles (id),
  "taskId" uuid references public.tasks (id) on delete set null,
  "createdAt" timestamptz not null default now(),
  "visibleTo" jsonb not null default '[]'::jsonb
);

alter table public.files enable row level security;

create policy "files_select_visible" on public.files for select to authenticated
  using (
    "uploadedById" = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'manager')
    or jsonb_array_length("visibleTo") = 0
    or "visibleTo" @> to_jsonb(auth.uid()::text)
  );
create policy "files_insert_own" on public.files for insert to authenticated
  with check ("uploadedById" = auth.uid());
create policy "files_update_own_or_manager" on public.files for update to authenticated
  using (
    "uploadedById" = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'manager')
  );
create policy "files_delete_own_or_manager" on public.files for delete to authenticated
  using (
    "uploadedById" = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'manager')
  );
