-- ============================================================
-- Run this entire file in your Supabase SQL Editor
-- Project > SQL Editor > New Query > paste > Run
-- ============================================================

-- 1. Sequence for unique user numbers (starts at 1000)
create sequence if not exists public.user_number_seq
  start with 1000 increment by 1;

-- 2. Profiles table (one row per auth user)
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  username    text unique not null,
  user_number integer unique not null,
  created_at  timestamptz default now()
);

-- 3. Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, user_number)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    nextval('public.user_number_seq')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Game sessions table
create table if not exists public.game_sessions (
  id              uuid default gen_random_uuid() primary key,
  host_id         uuid references auth.users not null,
  guest_id        uuid references auth.users,
  status          text not null default 'waiting'
                    check (status in ('waiting', 'topic_selection', 'playing', 'finished')),
  selected_topics jsonb  not null default '[]',
  topic_decks     jsonb  not null default '{}',
  current_card    jsonb,
  drawn_cards     jsonb  not null default '[]',
  saved_cards     jsonb  not null default '[]',
  total_drawn     integer not null default 0,
  card_key        integer not null default 0,
  current_turn    text    not null default 'host'
                    check (current_turn in ('host', 'guest')),
  game_type       text    not null default 'card'
                    check (game_type in ('card', 'connect4', 'dama')),
  game_state      jsonb   not null default '{}',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- 5. Enable Row Level Security
alter table public.profiles     enable row level security;
alter table public.game_sessions enable row level security;

-- 6. Profiles policies
create policy "Anyone authenticated can view profiles"
  on public.profiles for select
  to authenticated using (true);

create policy "Trigger inserts profiles"
  on public.profiles for insert
  to authenticated with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated using (auth.uid() = id);

-- 7. Game sessions policies
create policy "Players can view their sessions"
  on public.game_sessions for select
  to authenticated
  using (auth.uid() = host_id or auth.uid() = guest_id);

create policy "Authenticated users can create sessions as host"
  on public.game_sessions for insert
  to authenticated
  with check (auth.uid() = host_id);

create policy "Players can update their sessions"
  on public.game_sessions for update
  to authenticated
  using (auth.uid() = host_id or auth.uid() = guest_id);

-- 8. Enable Realtime on game_sessions
alter publication supabase_realtime add table public.game_sessions;
