-- ─────────────────────────────────────────────────────────────
-- TeachAssist — Initial Schema
-- Run this in Supabase SQL editor (Dashboard > SQL Editor)
-- ─────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- SCHOOLS
-- ─────────────────────────────────────────
create table public.schools (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  logo_url      text,
  location      text,
  contact_email text,
  admin_id      uuid not null references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- USERS (profile table extending auth.users)
-- ─────────────────────────────────────────
create table public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null default '',
  role       text not null default 'admin' check (role in ('admin', 'teacher', 'student')),
  school_id  uuid references public.schools(id) on delete set null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- CLASSROOMS
-- ─────────────────────────────────────────
create table public.classrooms (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  school_id  uuid not null references public.schools(id) on delete cascade,
  teacher_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- STUDENTS
-- ─────────────────────────────────────────
create table public.students (
  id           uuid primary key default uuid_generate_v4(),
  full_name    text not null,
  school_id    uuid not null references public.schools(id) on delete cascade,
  classroom_id uuid references public.classrooms(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- ATTENDANCE
-- ─────────────────────────────────────────
create type attendance_status as enum ('present', 'absent', 'late');

create table public.attendance (
  id           uuid primary key default uuid_generate_v4(),
  student_id   uuid not null references public.students(id) on delete cascade,
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  date         date not null,
  status       attendance_status not null,
  recorded_by  uuid references public.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  unique (student_id, classroom_id, date)
);

-- ─────────────────────────────────────────
-- MESSAGES (Teacher/Admin Communication)
-- ─────────────────────────────────────────
create table public.messages (
  id         uuid primary key default uuid_generate_v4(),
  school_id  uuid not null references public.schools(id) on delete cascade,
  sender_id  uuid not null references public.users(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);
