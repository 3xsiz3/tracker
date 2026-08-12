-- Миграция для уже развёрнутой базы: версии файлов + обсуждение файлов.
-- Выполнить один раз: Supabase Dashboard -> SQL Editor -> New query -> вставить целиком -> Run.

-- 1. Переносим существующие файлы (path/size/type) в новую колонку "versions".
alter table public.files add column if not exists versions jsonb not null default '[]'::jsonb;

update public.files
set versions = jsonb_build_array(
  jsonb_build_object(
    'fileName', name,
    'path', path,
    'size', size,
    'type', type,
    'uploadedById', "uploadedById",
    'createdAt', "createdAt"
  )
)
where jsonb_array_length(versions) = 0;

alter table public.files drop column path;
alter table public.files drop column size;
alter table public.files drop column type;

-- 2. Обсуждение файла — отдельная таблица, видимость комментариев совпадает
--    с видимостью самого файла.
create table public.file_comments (
  id uuid primary key default gen_random_uuid(),
  "fileId" uuid not null references public.files (id) on delete cascade,
  "authorId" uuid not null references public.profiles (id),
  text text not null,
  "createdAt" timestamptz not null default now()
);

alter table public.file_comments enable row level security;

create policy "file_comments_select_visible" on public.file_comments for select to authenticated
  using (
    exists (
      select 1 from public.files f
      where f.id = "fileId"
        and (
          f."uploadedById" = auth.uid()
          or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'manager')
          or jsonb_array_length(f."visibleTo") = 0
          or f."visibleTo" @> to_jsonb(auth.uid()::text)
        )
    )
  );
create policy "file_comments_insert_own" on public.file_comments for insert to authenticated
  with check (
    "authorId" = auth.uid()
    and exists (
      select 1 from public.files f
      where f.id = "fileId"
        and (
          f."uploadedById" = auth.uid()
          or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'manager')
          or jsonb_array_length(f."visibleTo") = 0
          or f."visibleTo" @> to_jsonb(auth.uid()::text)
        )
    )
  );
create policy "file_comments_delete_own" on public.file_comments for delete to authenticated
  using ("authorId" = auth.uid());
