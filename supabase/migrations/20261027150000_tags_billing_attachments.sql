-- Tags, billing (clients, fixed-price projects, invoices) and task attachments.
-- Same shape and access rules as the tables in the init migration.

create table public.tags (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table public.clients (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table public.billing_projects (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table public.invoices (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.tags enable row level security;
alter table public.clients enable row level security;
alter table public.billing_projects enable row level security;
alter table public.invoices enable row level security;

create policy "members manage tags" on public.tags for all to authenticated using (public.is_member()) with check (public.is_member());
create policy "members manage clients" on public.clients for all to authenticated using (public.is_member()) with check (public.is_member());
create policy "members manage billing projects" on public.billing_projects for all to authenticated using (public.is_member()) with check (public.is_member());
create policy "members manage invoices" on public.invoices for all to authenticated using (public.is_member()) with check (public.is_member());

alter table public.tags replica identity full;
alter table public.clients replica identity full;
alter table public.billing_projects replica identity full;
alter table public.invoices replica identity full;

alter publication supabase_realtime add table
  public.tags,
  public.clients,
  public.billing_projects,
  public.invoices;

-- Task attachments: private bucket, files under <task id>/<file>, members only
insert into storage.buckets (id, name, public, file_size_limit)
values ('attachments', 'attachments', false, 52428800);

create policy "members read attachments" on storage.objects for select to authenticated
  using (bucket_id = 'attachments' and public.is_member());
create policy "members upload attachments" on storage.objects for insert to authenticated
  with check (bucket_id = 'attachments' and public.is_member());
create policy "members delete attachments" on storage.objects for delete to authenticated
  using (bucket_id = 'attachments' and public.is_member());
