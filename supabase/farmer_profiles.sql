create table if not exists public.farmer_profiles (
  phone text primary key check (phone ~ '^\\+91[6-9][0-9]{9}$'),
  name text not null check (char_length(name) between 2 and 100),
  location text not null check (char_length(location) between 2 and 200),
  area numeric(12, 2) not null check (area > 0 and area <= 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.farmer_profiles enable row level security;

create or replace function public.set_farmer_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists farmer_profiles_updated_at on public.farmer_profiles;
create trigger farmer_profiles_updated_at
before update on public.farmer_profiles
for each row execute function public.set_farmer_profile_updated_at();
