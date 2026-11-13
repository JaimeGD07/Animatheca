-- Animatheca: biblioteca personal de películas animadas.
-- Ejecutar completo en Supabase > SQL Editor > New query.
-- Requiere: Authentication > Sign In / Providers > "Allow anonymous sign-ins" activado.

create table if not exists public.library_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid()
               references auth.users (id) on delete cascade,
  tmdb_id      integer not null,
  title        text not null,
  poster_path  text,
  release_date text,
  status       text not null default 'por_ver'
               check (status in ('por_ver', 'vista')),
  is_favorite  boolean not null default false,
  rating       smallint check (rating between 1 and 5),
  notes        text check (char_length(notes) <= 1000),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, tmdb_id)
);

create index if not exists library_entries_user_id_idx
  on public.library_entries (user_id);

-- Mantiene updated_at al día en cada UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists library_entries_set_updated_at on public.library_entries;
create trigger library_entries_set_updated_at
  before update on public.library_entries
  for each row execute function public.set_updated_at();

-- Row Level Security: cada visitante (sesión anónima) solo ve y edita sus filas.
-- Los usuarios anónimos usan el rol "authenticated".
alter table public.library_entries enable row level security;

drop policy if exists "library_select_own" on public.library_entries;
create policy "library_select_own" on public.library_entries
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "library_insert_own" on public.library_entries;
create policy "library_insert_own" on public.library_entries
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "library_update_own" on public.library_entries;
create policy "library_update_own" on public.library_entries
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "library_delete_own" on public.library_entries;
create policy "library_delete_own" on public.library_entries
  for delete to authenticated
  using ((select auth.uid()) = user_id);
