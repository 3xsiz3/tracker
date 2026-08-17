-- Схема БД для трекера развития навыков.
-- Выполнить один раз: Supabase Dashboard -> SQL Editor -> New query -> вставить целиком -> Run.
--
-- Колонки названы в camelCase (в кавычках), чтобы совпадать с полями TypeScript-типов
-- в src/types/index.ts один в один — без слоя маппинга snake_case <-> camelCase в коде.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  role text not null check (role in ('manager', 'employee')),
  "managerId" uuid references public.profiles (id),
  "avatarColor" text not null default 'bg-slate-500'
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  competency text not null,
  "assigneeId" uuid not null references public.profiles (id),
  "createdById" uuid not null references public.profiles (id),
  "checklistOwner" text not null check ("checklistOwner" in ('manager', 'employee')),
  checklist jsonb not null default '[]'::jsonb,
  "dueDate" date,
  "createdAt" timestamptz not null default now(),
  history jsonb not null default '[]'::jsonb,
  "confirmedAt" timestamptz,
  "confirmedById" uuid references public.profiles (id),
  "verificationQuestions" jsonb not null default '[]'::jsonb
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  "taskId" uuid not null references public.tasks (id) on delete cascade,
  "authorId" uuid not null references public.profiles (id),
  text text not null,
  "createdAt" timestamptz not null default now(),
  attachments jsonb not null default '[]'::jsonb
);

create table public.assessments (
  "taskId" uuid primary key references public.tasks (id) on delete cascade,
  "assessedById" uuid not null references public.profiles (id),
  "assessedAt" timestamptz not null default now(),
  quality int not null check (quality between 1 and 5),
  timeliness int not null check (timeliness between 1 and 5),
  autonomy int not null check (autonomy between 1 and 5)
);

-- Папки для группировки файлов (плоские, без вложенности). Создавать может только
-- руководитель; удаление папки не удаляет файлы внутри — они просто становятся "без папки".
create table public.folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  "createdById" uuid not null references public.profiles (id),
  "createdAt" timestamptz not null default now()
);

-- Общая библиотека файлов проекта (вкладка «Файлы»). Заполняется как автоматически
-- (вложения к комментариям задач), так и вручную — руководителем или сотрудником.
-- "visibleTo" — пустой массив = видно всем; непустой = видно только перечисленным
-- id пользователей (плюс всегда — автору файла и любому руководителю).
-- "versions" — история версий файла, каждый элемент {fileName, path, size, type,
-- uploadedById, createdAt}; последний элемент массива — текущая версия.
create table public.files (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  note text not null default '',
  "uploadedById" uuid not null references public.profiles (id),
  "taskId" uuid references public.tasks (id) on delete set null,
  "folderId" uuid references public.folders (id) on delete set null,
  "createdAt" timestamptz not null default now(),
  "visibleTo" jsonb not null default '[]'::jsonb,
  versions jsonb not null default '[]'::jsonb
);

-- Обсуждение файла (вкладка «Файлы» -> открыть файл). Видимость комментариев
-- совпадает с видимостью самого файла.
create table public.file_comments (
  id uuid primary key default gen_random_uuid(),
  "fileId" uuid not null references public.files (id) on delete cascade,
  "authorId" uuid not null references public.profiles (id),
  text text not null,
  "createdAt" timestamptz not null default now(),
  attachments jsonb not null default '[]'::jsonb
);

-- Row Level Security.
-- Команда маленькая и доверенная: чтение открыто всем авторизованным, запись — только
-- своих данных / данных, где ты руководитель или исполнитель задачи.

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.comments enable row level security;
alter table public.assessments enable row level security;
alter table public.files enable row level security;
alter table public.file_comments enable row level security;
alter table public.folders enable row level security;

create policy "profiles_select_all" on public.profiles for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid());

create policy "tasks_select_all" on public.tasks for select to authenticated using (true);
create policy "tasks_insert_manager" on public.tasks for insert to authenticated
  with check (
    "createdById" = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'manager')
  );
create policy "tasks_update_involved" on public.tasks for update to authenticated
  using ("assigneeId" = auth.uid() or "createdById" = auth.uid());
create policy "tasks_delete_creator" on public.tasks for delete to authenticated
  using ("createdById" = auth.uid());

create policy "comments_select_all" on public.comments for select to authenticated using (true);
create policy "comments_insert_own" on public.comments for insert to authenticated
  with check ("authorId" = auth.uid());
create policy "comments_delete_own" on public.comments for delete to authenticated
  using ("authorId" = auth.uid());

create policy "assessments_select_all" on public.assessments for select to authenticated using (true);
create policy "assessments_insert_own" on public.assessments for insert to authenticated
  with check ("assessedById" = auth.uid());
create policy "assessments_update_own" on public.assessments for update to authenticated
  using ("assessedById" = auth.uid());

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

-- Комментарий к файлу виден, только если виден сам файл (та же логика, что в
-- "files_select_visible" выше — продублирована, так как политики не могут её переиспользовать).
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

-- Хранилище файлов, прикладываемых к комментариям (Storage).
-- Бакет приватный: файлы отдаются только по подписанной ссылке (createSignedUrl),
-- доступ на чтение/запись — всем авторизованным пользователям, как и остальные данные.

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

create policy "attachments_select_authenticated" on storage.objects for select to authenticated
  using (bucket_id = 'attachments');
create policy "attachments_insert_authenticated" on storage.objects for insert to authenticated
  with check (bucket_id = 'attachments');
create policy "attachments_delete_authenticated" on storage.objects for delete to authenticated
  using (bucket_id = 'attachments');
