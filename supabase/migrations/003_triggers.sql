-- ─────────────────────────────────────────────────────────────
-- TeachAssist — Triggers
-- Run AFTER 002_rls_policies.sql
-- ─────────────────────────────────────────────────────────────

-- Auto-create public.users profile row when auth.users gets a new row
-- This fires for both direct signup AND admin.inviteUserByEmail
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _school_id uuid;
begin
  -- Parse school_id from metadata if present (teacher invites pass it)
  _school_id := nullif(new.raw_user_meta_data->>'school_id', '')::uuid;

  insert into public.users (id, full_name, role, school_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'admin'),
    _school_id
  )
  on conflict (id) do nothing;  -- idempotent: skip if row already exists

  return new;
end;
$$;

-- Drop and recreate trigger to ensure latest version
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- REALTIME: Enable for messages table
-- (allows Supabase Realtime subscriptions)
-- ─────────────────────────────────────────
alter publication supabase_realtime add table public.messages;
