-- ─────────────────────────────────────────────────────────────
-- TeachAssist — New Features Migration
-- Run AFTER 003_triggers.sql
-- ─────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────
-- Feature: Extended student profile fields
-- ─────────────────────────────────────────────────────────────
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS parent_name text,
  ADD COLUMN IF NOT EXISTS parent_phone text,
  ADD COLUMN IF NOT EXISTS bio text;

-- ─────────────────────────────────────────────────────────────
-- Feature: Teachers can insert students into their own classrooms
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "teachers_insert_students_own_classroom"
  ON students FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classrooms c
      WHERE c.id = students.classroom_id
        AND c.teacher_id = auth.uid()
    )
    AND school_id = (
      SELECT c2.school_id FROM classrooms c2
      WHERE c2.id = students.classroom_id
    )
  );

-- ─────────────────────────────────────────────────────────────
-- Feature: Private direct messages between staff
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS direct_messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id    uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  sender_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content      text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dm_select_own" ON direct_messages FOR SELECT TO authenticated
  USING (
    (sender_id = auth.uid() OR recipient_id = auth.uid())
    AND school_id IN (SELECT school_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "dm_insert_own" ON direct_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND school_id IN (SELECT school_id FROM users WHERE id = auth.uid())
  );

ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;

-- ─────────────────────────────────────────────────────────────
-- Note: Create a 'student-photos' storage bucket in Supabase
-- Dashboard → Storage → New bucket
-- Name: student-photos
-- Public: true
-- ─────────────────────────────────────────────────────────────
