-- ─────────────────────────────────────────────────────────────
-- TeachAssist — Row Level Security Policies
-- Run AFTER 001_initial_schema.sql
-- ─────────────────────────────────────────────────────────────

-- Enable RLS on all tables
alter table public.schools    enable row level security;
alter table public.users      enable row level security;
alter table public.classrooms enable row level security;
alter table public.students   enable row level security;
alter table public.attendance enable row level security;
alter table public.messages   enable row level security;

-- ─────────────────────────────────────────
-- HELPER FUNCTIONS (security definer = run as owner, not caller)
-- ─────────────────────────────────────────
create or replace function public.my_school_id()
returns uuid language sql security definer stable as $$
  select school_id from public.users where id = auth.uid();
$$;

create or replace function public.my_role()
returns text language sql security definer stable as $$
  select role from public.users where id = auth.uid();
$$;

-- ─────────────────────────────────────────
-- SCHOOLS
-- ─────────────────────────────────────────
create policy "users_select_own_school" on public.schools
  for select using (
    id = public.my_school_id()
  );

create policy "admin_insert_school" on public.schools
  for insert with check (admin_id = auth.uid());

create policy "admin_update_school" on public.schools
  for update using (admin_id = auth.uid());

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
-- Allow self-insert (signup flow creates the profile row)
create policy "allow_self_insert" on public.users
  for insert with check (id = auth.uid());

-- Users can view/update their own profile
create policy "user_select_own" on public.users
  for select using (id = auth.uid());

create policy "user_update_own" on public.users
  for update using (id = auth.uid());

-- Admins can view all users in their school
create policy "admin_select_school_users" on public.users
  for select using (
    school_id = public.my_school_id()
    and public.my_role() = 'admin'
  );

-- Admins can manage users in their school
create policy "admin_update_school_users" on public.users
  for update using (
    school_id = public.my_school_id()
    and public.my_role() = 'admin'
  );

-- ─────────────────────────────────────────
-- CLASSROOMS
-- ─────────────────────────────────────────
create policy "admin_all_classrooms" on public.classrooms
  for all using (
    school_id = public.my_school_id()
    and public.my_role() = 'admin'
  );

create policy "teacher_select_own_classrooms" on public.classrooms
  for select using (
    teacher_id = auth.uid()
    and public.my_role() = 'teacher'
  );

-- ─────────────────────────────────────────
-- STUDENTS
-- ─────────────────────────────────────────
create policy "admin_all_students" on public.students
  for all using (
    school_id = public.my_school_id()
    and public.my_role() = 'admin'
  );

create policy "teacher_select_students" on public.students
  for select using (
    public.my_role() = 'teacher'
    and classroom_id in (
      select id from public.classrooms where teacher_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- ATTENDANCE
-- ─────────────────────────────────────────
create policy "admin_all_attendance" on public.attendance
  for all using (
    classroom_id in (
      select id from public.classrooms
      where school_id = public.my_school_id()
    )
    and public.my_role() = 'admin'
  );

create policy "teacher_manage_attendance" on public.attendance
  for all using (
    classroom_id in (
      select id from public.classrooms where teacher_id = auth.uid()
    )
    and public.my_role() = 'teacher'
  );

-- ─────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────
-- Teachers and admins in same school can read all messages
create policy "school_members_select_messages" on public.messages
  for select using (
    school_id = public.my_school_id()
    and public.my_role() in ('admin', 'teacher')
  );

-- Teachers and admins can send messages
create policy "school_members_insert_messages" on public.messages
  for insert with check (
    school_id = public.my_school_id()
    and sender_id = auth.uid()
    and public.my_role() in ('admin', 'teacher')
  );

-- Only sender or admin can delete a message
create policy "message_delete" on public.messages
  for delete using (
    sender_id = auth.uid()
    or public.my_role() = 'admin'
  );
