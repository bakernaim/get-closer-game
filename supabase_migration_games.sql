-- ============================================================
-- Run this ONLY if you already ran supabase_setup.sql before.
-- If you're setting up fresh, use supabase_setup.sql instead.
-- ============================================================

alter table public.game_sessions
  add column if not exists game_type text not null default 'card'
    check (game_type in ('card', 'connect4', 'dama')),
  add column if not exists game_state jsonb not null default '{}';
