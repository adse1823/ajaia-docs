-- Documents table
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users on delete cascade not null,
  title text not null default 'Untitled Document',
  content text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Document shares table
create table if not exists document_shares (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents on delete cascade not null,
  shared_with_id uuid references auth.users on delete cascade not null,
  permission text default 'editor' check (permission in ('viewer', 'editor')),
  created_at timestamptz default now(),
  unique(document_id, shared_with_id)
);

-- Profiles view so we can look up users by email
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  display_name text
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists documents_updated_at on documents;
create trigger documents_updated_at
  before update on documents
  for each row execute function update_updated_at();

-- Enable RLS
alter table documents enable row level security;
alter table document_shares enable row level security;
alter table profiles enable row level security;

-- RLS: documents
create policy "Users can view own and shared documents"
  on documents for select
  using (
    owner_id = auth.uid()
    or id in (
      select document_id from document_shares where shared_with_id = auth.uid()
    )
  );

create policy "Users can insert own documents"
  on documents for insert
  with check (owner_id = auth.uid());

create policy "Users can update own documents"
  on documents for update
  using (owner_id = auth.uid());

create policy "Users can delete own documents"
  on documents for delete
  using (owner_id = auth.uid());

-- RLS: document_shares
create policy "Document owners can manage shares"
  on document_shares for all
  using (
    document_id in (
      select id from documents where owner_id = auth.uid()
    )
  );

create policy "Shared users can view their shares"
  on document_shares for select
  using (shared_with_id = auth.uid());

-- RLS: profiles
create policy "Anyone authenticated can view profiles"
  on profiles for select
  using (auth.uid() is not null);

create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid());
