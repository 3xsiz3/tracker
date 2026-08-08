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
  "createdAt" timestamptz not null default now()
);

create table public.assessments (
  "taskId" uuid primary key references public.tasks (id) on delete cascade,
  "assessedById" uuid not null references public.profiles (id),
  "assessedAt" timestamptz not null default now(),
  quality int not null check (quality between 1 and 5),
  timeliness int not null check (timeliness between 1 and 5),
  autonomy int not null check (autonomy between 1 and 5)
);

-- Row Level Security.
-- Команда маленькая и доверенная: чтение открыто всем авторизованным, запись — только
-- своих данных / данных, где ты руководитель или исполнитель задачи.

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.comments enable row level security;
alter table public.assessments enable row level security;

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

create policy "assessments_select_all" on public.assessments for select to authenticated using (true);
create policy "assessments_insert_own" on public.assessments for insert to authenticated
  with check ("assessedById" = auth.uid());
create policy "assessments_update_own" on public.assessments for update to authenticated
  using ("assessedById" = auth.uid());
