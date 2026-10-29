-- Companies: each team (group) can belong to one, via groups.data ->> 'companyId'.
-- Same shape and access rules as the other collections.

create table public.companies (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.companies enable row level security;

create policy "members manage companies" on public.companies for all to authenticated using (public.is_member()) with check (public.is_member());

alter table public.companies replica identity full;

alter publication supabase_realtime add table public.companies;
