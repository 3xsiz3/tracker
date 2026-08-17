-- Миграция для уже развёрнутой базы: папки для файлов.
-- Выполнить один раз: Supabase Dashboard -> SQL Editor -> New query -> вставить целиком -> Run.

create table public.folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  "createdById" uuid not null references public.profiles (id),
  "createdAt" timestamptz not null default now()
);

alter table public.files add column if not exists "folderId" uuid references public.folders (id) on delete set null;

alter table public.folders enable row level security;

create policy "folders_select_all" on public.folders for select to authenticated using (true);
create policy "folders_insert_manager" on public.folders for insert to authenticated
  with check (
    "createdById" = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'manager')
  );
create policy "folders_update_manager" on public.folders for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'manager'));
create policy "folders_delete_manager" on public.folders for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'manager'));
