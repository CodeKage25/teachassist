-- ─────────────────────────────────────────────────────────────
-- TeachAssist — Kcolos: assessments, AI reports, parent portal
-- Run AFTER 004_new_features.sql (Supabase Dashboard > SQL Editor)
-- ─────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────
-- 1. PARENT ROLE
-- ─────────────────────────────────────────
alter table public.users drop constraint if exists users_role_check;
alter table public.users
  add constraint users_role_check
  check (role in ('admin', 'teacher', 'student', 'parent'));

-- ─────────────────────────────────────────
-- 2. GUARDIANS (parent ↔ student link)
-- ─────────────────────────────────────────
create table public.student_guardians (
  id           uuid primary key default uuid_generate_v4(),
  parent_id    uuid not null references public.users(id) on delete cascade,
  student_id   uuid not null references public.students(id) on delete cascade,
  relationship text,
  created_at   timestamptz not null default now(),
  unique (parent_id, student_id)
);

-- ─────────────────────────────────────────
-- 3. ASSESSMENTS (CA tests, exams, quizzes)
-- ─────────────────────────────────────────
create table public.assessments (
  id           uuid primary key default uuid_generate_v4(),
  school_id    uuid not null references public.schools(id) on delete cascade,
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  subject      text not null,
  title        text not null,
  type         text not null default 'ca'
               check (type in ('ca', 'exam', 'quiz', 'assignment')),
  term         text not null,
  max_score    numeric not null default 100 check (max_score > 0),
  assessed_on  date not null default current_date,
  created_by   uuid references public.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

create table public.assessment_results (
  id            uuid primary key default uuid_generate_v4(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  student_id    uuid not null references public.students(id) on delete cascade,
  score         numeric not null check (score >= 0),
  remark        text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (assessment_id, student_id)
);

-- ─────────────────────────────────────────
-- 4. STUDENT REPORTS (Kcolos AI + teacher vetting)
-- ─────────────────────────────────────────
-- strengths / focus_areas are AI-drafted, teacher-edited JSON.
-- focus_areas item shape:
--   { "area", "observation", "suggestion", "home_support",
--     "resources": [{ "type": "youtube"|"reading"|"practice", "title", "url" }] }
create table public.student_reports (
  id           uuid primary key default uuid_generate_v4(),
  school_id    uuid not null references public.schools(id) on delete cascade,
  student_id   uuid not null references public.students(id) on delete cascade,
  classroom_id uuid references public.classrooms(id) on delete set null,
  teacher_id   uuid references public.users(id) on delete set null,
  term         text not null,
  status       text not null default 'draft' check (status in ('draft', 'published')),
  summary      text,
  strengths    jsonb not null default '[]'::jsonb,
  focus_areas  jsonb not null default '[]'::jsonb,
  teacher_note text,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (student_id, term)
);

-- ─────────────────────────────────────────
-- 5. HELPERS
-- ─────────────────────────────────────────
create or replace function public.is_guardian_of(sid uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.student_guardians
    where parent_id = auth.uid() and student_id = sid
  );
$$;

-- Teacher owns a classroom?
create or replace function public.teaches_classroom(cid uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.classrooms
    where id = cid and teacher_id = auth.uid()
  );
$$;

-- ─────────────────────────────────────────
-- 6. ROW LEVEL SECURITY
-- ─────────────────────────────────────────
alter table public.student_guardians  enable row level security;
alter table public.assessments        enable row level security;
alter table public.assessment_results enable row level security;
alter table public.student_reports    enable row level security;

-- Guardians: parents see their own links; admins manage links in their school
create policy "parent_select_own_links" on public.student_guardians
  for select using (parent_id = auth.uid());

create policy "admin_manage_guardians" on public.student_guardians
  for all using (
    public.my_role() = 'admin'
    and exists (
      select 1 from public.students s
      where s.id = student_id and s.school_id = public.my_school_id()
    )
  );

-- Students: parents may read their own children
create policy "parent_select_own_children" on public.students
  for select using (public.is_guardian_of(id));

-- Attendance: parents may read their own children's records
create policy "parent_select_child_attendance" on public.attendance
  for select using (public.is_guardian_of(student_id));

-- Assessments: staff in school read; classroom teacher/admin write;
-- parents read assessments for their child's classroom
create policy "staff_select_assessments" on public.assessments
  for select using (
    school_id = public.my_school_id()
    and public.my_role() in ('admin', 'teacher')
  );

create policy "staff_write_assessments" on public.assessments
  for all using (
    school_id = public.my_school_id()
    and (public.my_role() = 'admin' or public.teaches_classroom(classroom_id))
  );

create policy "parent_select_child_assessments" on public.assessments
  for select using (
    exists (
      select 1
      from public.student_guardians g
      join public.students s on s.id = g.student_id
      where g.parent_id = auth.uid()
        and s.classroom_id = assessments.classroom_id
    )
  );

-- Results: staff via the parent assessment; parents via guardianship
create policy "staff_select_results" on public.assessment_results
  for select using (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id
        and a.school_id = public.my_school_id()
        and public.my_role() in ('admin', 'teacher')
    )
  );

create policy "staff_write_results" on public.assessment_results
  for all using (
    exists (
      select 1 from public.assessments a
      where a.id = assessment_id
        and a.school_id = public.my_school_id()
        and (public.my_role() = 'admin' or public.teaches_classroom(a.classroom_id))
    )
  );

create policy "parent_select_child_results" on public.assessment_results
  for select using (public.is_guardian_of(student_id));

-- Reports: staff in school read; classroom teacher/admin write;
-- parents read ONLY published reports for their children
create policy "staff_select_reports" on public.student_reports
  for select using (
    school_id = public.my_school_id()
    and public.my_role() in ('admin', 'teacher')
  );

create policy "staff_write_reports" on public.student_reports
  for all using (
    school_id = public.my_school_id()
    and (
      public.my_role() = 'admin'
      or (classroom_id is not null and public.teaches_classroom(classroom_id))
    )
  );

create policy "parent_select_published_reports" on public.student_reports
  for select using (
    status = 'published' and public.is_guardian_of(student_id)
  );

-- ─────────────────────────────────────────
-- 7. updated_at maintenance
-- ─────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger touch_assessment_results before update on public.assessment_results
  for each row execute procedure public.touch_updated_at();

create trigger touch_student_reports before update on public.student_reports
  for each row execute procedure public.touch_updated_at();
