import { createClient } from '@/lib/supabase/server'
import type { UserProfile } from '@/types/database'

export type TeacherWithClassroom = UserProfile & {
  classroom: { id: string; name: string } | null
}

export async function getTeachers(schoolId: string): Promise<TeacherWithClassroom[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('school_id', schoolId)
    .eq('role', 'teacher')
    .order('created_at', { ascending: false })

  if (error || !data) return []

  // Fetch assigned classrooms separately to avoid join type issues
  const teacherIds = data.map((t) => t.id)
  const { data: classrooms } = await supabase
    .from('classrooms')
    .select('id, name, teacher_id')
    .eq('school_id', schoolId)
    .in('teacher_id', teacherIds)

  const classroomMap: Record<string, { id: string; name: string }> = {}
  classrooms?.forEach((c) => {
    if (c.teacher_id) classroomMap[c.teacher_id] = { id: c.id, name: c.name }
  })

  return data.map((t) => ({ ...t, classroom: classroomMap[t.id] ?? null }))
}

export async function getTeacher(teacherId: string): Promise<TeacherWithClassroom | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', teacherId)
    .single()

  if (error || !data) return null

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name')
    .eq('teacher_id', teacherId)
    .maybeSingle()

  return { ...data, classroom: classroom ?? null }
}
