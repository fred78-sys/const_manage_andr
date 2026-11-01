-- SiteFlow Supabase schema (PostgreSQL)
-- Run in Supabase SQL Editor on a new project.
-- New registrations receive the restricted 'client' role. Promote the first
-- administrator manually using the SQL shown in README.md.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'client' check (role in ('admin','pm','supervisor','client')),
  phone text,
  assigned_project_ids uuid[] not null default '{}',
  avatar_url text,
  company_title text,
  nca_reg_no text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  client_name text not null,
  client_email text not null default '',
  address text not null default '',
  county text not null default '',
  sub_county text,
  lr_number text,
  nca_project_number text,
  nca_category text,
  nema_license_number text,
  county_permit_number text,
  start_date date,
  end_date date,
  status text not null default 'planning' check (status in ('planning','active','delayed','completed','on_hold')),
  budget_total numeric(18,2) not null default 0,
  budget_categories jsonb not null default '{"labor":0,"materials":0,"equipment":0,"other":0}'::jsonb,
  percent_complete numeric(5,2) not null default 0 check (percent_complete between 0 and 100),
  pm_id uuid references public.profiles(id) on delete set null,
  pm_name text not null default '',
  supervisor_id uuid references public.profiles(id) on delete set null,
  supervisor_name text not null default '',
  description text not null default '',
  cover_image text,
  created_at timestamptz not null default now()
);

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  assigned_role text,
  assigned_at timestamptz not null default now(),
  primary key (project_id,user_id)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  project_name text,
  title text not null,
  description text not null default '',
  trade text not null default '',
  priority text not null default 'medium' check (priority in ('high','medium','low')),
  status text not null default 'todo' check (status in ('todo','in_progress','blocked','done')),
  assignee_name text not null default '',
  assignee_role text,
  due_date date,
  block_reason text,
  checklist jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  project_name text,
  date date not null,
  weather jsonb not null default '{}'::jsonb,
  crew jsonb not null default '{"total":0,"breakdown":[]}'::jsonb,
  material_deliveries text,
  work_done text not null,
  issues text,
  issue_severity text not null default 'none' check (issue_severity in ('none','minor','moderate','critical')),
  photos jsonb not null default '[]'::jsonb,
  supervisor_name text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  project_name text,
  date date not null,
  category text not null check (category in ('labor','materials','equipment','statutory','other')),
  vendor text not null,
  amount numeric(18,2) not null check (amount >= 0),
  payment_method text check (payment_method in ('mpesa','bank_transfer','cheque','petty_cash')),
  mpesa_ref text,
  invoice_number text,
  notes text,
  recorded_by text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  project_name text,
  title text not null,
  category text not null check (category in ('nca_nema','county_permit','structural_arch','bq_financial','contracts_safety','other')),
  file_url text not null,
  storage_path text,
  file_name text not null,
  file_size text not null default '',
  version text not null default '',
  upload_date date not null default current_date,
  uploaded_by text not null default '',
  notes text
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  project_name text not null default '',
  timestamp timestamptz not null default now(),
  user_name text not null default '',
  role text not null default 'client' check (role in ('admin','pm','supervisor','client')),
  action text not null,
  details text not null default ''
);

create index if not exists projects_status_idx on public.projects(status);
create index if not exists projects_pm_idx on public.projects(pm_id);
create index if not exists tasks_project_idx on public.tasks(project_id);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists daily_logs_project_date_idx on public.daily_logs(project_id,date desc);
create index if not exists expenses_project_date_idx on public.expenses(project_id,date desc);
create index if not exists documents_project_idx on public.documents(project_id);
create index if not exists activities_project_timestamp_idx on public.activities(project_id,"timestamp" desc);
create index if not exists project_members_user_idx on public.project_members(user_id);

-- Keep the user profile synchronized with Supabase Auth metadata.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id,name,email,role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email,'@',1)),
    new.email,
    'client'
  ) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin' and p.is_active = true);
$$;

create or replace function public.has_project_access(target_project uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_admin() or exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.is_active = true
      and (target_project = any(p.assigned_project_ids))
  ) or exists (
    select 1 from public.project_members pm
    join public.profiles p on p.id = pm.user_id
    where pm.project_id = target_project and pm.user_id = (select auth.uid()) and p.is_active = true
  ) or exists (
    select 1 from public.projects pr
    join public.profiles p on p.id = (select auth.uid())
    where pr.id = target_project and p.is_active = true
      and ((pr.pm_id = (select auth.uid())) or (pr.supervisor_id = (select auth.uid())))
  );
$$;

-- RLS is mandatory: the anon/publishable key is safe in the app only with RLS.
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.daily_logs enable row level security;
alter table public.expenses enable row level security;
alter table public.documents enable row level security;
alter table public.activities enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin" on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.is_admin());
create or replace function public.current_profile_role()
returns text language sql stable security definer set search_path = '' as $$
  select p.role from public.profiles p where p.id = (select auth.uid());
$$;
drop policy if exists "profiles_update_admin_only" on public.profiles;
create policy "profiles_update_admin_only" on public.profiles for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "projects_select_assigned" on public.projects for select to authenticated using (public.has_project_access(id));
create policy "projects_insert_admin_pm" on public.projects for insert to authenticated
with check (public.is_admin() or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='pm' and p.is_active=true) and pm_id=(select auth.uid()));
create policy "projects_update_admin_pm" on public.projects for update to authenticated
using (public.is_admin() or (pm_id=(select auth.uid()) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='pm' and p.is_active=true)))
with check (public.is_admin() or (pm_id=(select auth.uid()) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='pm' and p.is_active=true)));
create policy "projects_delete_admin" on public.projects for delete to authenticated using (public.is_admin());

create policy "project_members_select_access" on public.project_members for select to authenticated using (public.has_project_access(project_id));
create policy "project_members_insert_admin_or_assigned_pm" on public.project_members for insert to authenticated
with check (public.is_admin() or (public.current_profile_role() = 'pm' and exists(select 1 from public.profiles u where u.id=(select auth.uid()) and u.is_active=true) and exists(select 1 from public.projects p where p.id = project_id and p.pm_id = (select auth.uid()))));
create policy "project_members_delete_admin" on public.project_members for delete to authenticated using (public.is_admin());

create policy "tasks_select_project" on public.tasks for select to authenticated using (public.has_project_access(project_id));
create policy "tasks_insert_project_staff" on public.tasks for insert to authenticated with check (public.has_project_access(project_id) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('admin','pm','supervisor')));
create policy "tasks_update_project_staff" on public.tasks for update to authenticated using (public.has_project_access(project_id) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('admin','pm','supervisor'))) with check (public.has_project_access(project_id));
create policy "tasks_delete_admin_pm" on public.tasks for delete to authenticated using (public.is_admin() or (public.has_project_access(project_id) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='pm' and p.is_active=true)));

create policy "daily_logs_select_project" on public.daily_logs for select to authenticated using (public.has_project_access(project_id));
create policy "daily_logs_insert_staff" on public.daily_logs for insert to authenticated with check (public.has_project_access(project_id) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('admin','pm','supervisor')));
create policy "daily_logs_update_staff" on public.daily_logs for update to authenticated using (public.has_project_access(project_id) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('admin','pm','supervisor'))) with check (public.has_project_access(project_id));
create policy "daily_logs_delete_admin_pm" on public.daily_logs for delete to authenticated using (public.is_admin() or (public.has_project_access(project_id) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='pm' and p.is_active=true)));

create policy "expenses_select_project" on public.expenses for select to authenticated using (public.has_project_access(project_id) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('admin','pm')));
create policy "expenses_insert_staff" on public.expenses for insert to authenticated with check (public.has_project_access(project_id) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('admin','pm','supervisor')));
create policy "expenses_update_admin_pm" on public.expenses for update to authenticated using (public.has_project_access(project_id) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('admin','pm'))) with check (public.has_project_access(project_id));
create policy "expenses_delete_admin" on public.expenses for delete to authenticated using (public.is_admin());

create policy "documents_select_project" on public.documents for select to authenticated using (public.has_project_access(project_id));
create policy "documents_insert_staff" on public.documents for insert to authenticated with check (public.has_project_access(project_id) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('admin','pm','supervisor')));
create policy "documents_delete_admin_pm" on public.documents for delete to authenticated using (public.is_admin() or (public.has_project_access(project_id) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='pm' and p.is_active=true)));

create policy "activities_select_project" on public.activities for select to authenticated using (project_id is not null and public.has_project_access(project_id));
create policy "activities_insert_project_staff" on public.activities for insert to authenticated with check (project_id is not null and public.has_project_access(project_id) and public.current_profile_role() in ('admin','pm','supervisor'));

-- Storage buckets. Public read is intentionally disabled; use signed URLs for private files.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('project-documents','project-documents',false,52428800,null),
       ('daily-log-photos','daily-log-photos',false,15728640,array['image/jpeg','image/png','image/webp','image/heic'])
on conflict (id) do nothing;

create policy "project_files_read_members" on storage.objects for select to authenticated
using (bucket_id in ('project-documents','daily-log-photos') and public.has_project_access((storage.foldername(name))[1]::uuid));
create policy "project_files_upload_members" on storage.objects for insert to authenticated
with check (bucket_id in ('project-documents','daily-log-photos') and public.has_project_access((storage.foldername(name))[1]::uuid) and public.current_profile_role() in ('admin','pm','supervisor'));
create policy "project_files_delete_admin_pm" on storage.objects for delete to authenticated
using (bucket_id in ('project-documents','daily-log-photos') and (public.is_admin() or (public.current_profile_role()='pm' and public.has_project_access(((storage.foldername(name))[1])::uuid) and exists(select 1 from public.profiles u where u.id=(select auth.uid()) and u.is_active=true) and exists(select 1 from public.projects p where p.id=((storage.foldername(name))[1])::uuid and p.pm_id=(select auth.uid())))));

-- Enable realtime for app tables. If already in publication, ignore duplicate errors.
do $$ begin
  alter publication supabase_realtime add table public.projects, public.tasks, public.daily_logs, public.expenses, public.documents, public.activities;
exception when duplicate_object then null; when undefined_object then null; end $$;
