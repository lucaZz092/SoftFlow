-- SoftFlow schema
-- Each collection stores the app's object as JSONB (`data`), mirroring the front-end types in src/types.
-- Access is limited to the e-mails listed in public.allowed_emails (defined below).

create table public.groups (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table public.automations (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table public.run_logs (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table public.custom_columns (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- Public profile for each signed-in user, used as the list of assignable members
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'user_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Who may use the workspace. Signing in with GitHub is not enough: the account's e-mail must be here.
-- Add yours after applying this migration:
--   insert into public.allowed_emails (email) values ('voce@exemplo.com');
create table public.allowed_emails (
  email text primary key check (email = lower(email))
);

create function public.is_member()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.allowed_emails where email = lower(auth.jwt() ->> 'email')
  );
$$;

grant execute on function public.is_member() to authenticated;

-- Row Level Security: only allowlisted users can read and write.
-- Server code uses the service role key, which bypasses RLS. allowed_emails has no policies,
-- so it can only be edited from the SQL editor or with the service role.
alter table public.allowed_emails enable row level security;
alter table public.groups enable row level security;
alter table public.tasks enable row level security;
alter table public.automations enable row level security;
alter table public.run_logs enable row level security;
alter table public.custom_columns enable row level security;
alter table public.profiles enable row level security;

create policy "members manage groups" on public.groups for all to authenticated using (public.is_member()) with check (public.is_member());
create policy "members manage tasks" on public.tasks for all to authenticated using (public.is_member()) with check (public.is_member());
create policy "members manage automations" on public.automations for all to authenticated using (public.is_member()) with check (public.is_member());
create policy "members manage run logs" on public.run_logs for all to authenticated using (public.is_member()) with check (public.is_member());
create policy "members manage custom columns" on public.custom_columns for all to authenticated using (public.is_member()) with check (public.is_member());
create policy "members read profiles" on public.profiles for select to authenticated using (public.is_member());
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid() = id and public.is_member());

-- Realtime: broadcast changes so every open client stays in sync
alter table public.groups replica identity full;
alter table public.tasks replica identity full;
alter table public.automations replica identity full;
alter table public.run_logs replica identity full;
alter table public.custom_columns replica identity full;

alter publication supabase_realtime add table
  public.groups,
  public.tasks,
  public.automations,
  public.run_logs,
  public.custom_columns,
  public.profiles;
