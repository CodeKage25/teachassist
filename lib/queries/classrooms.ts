import { createClient } from '@/lib/supabase/server'
import type { Classroom, Student } from '@/types/database'

export type ClassroomWithTeacher = Classroom & {
  teacher: { id: string; full_name: string } | null
}

export type ClassroomWithCount = Classroom & {
  students: { count: number }[]
}

export async function getClassrooms(schoolId: string): Promise<ClassroomWithTeacher[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  // Fetch teachers separately to avoid join type issues
  const teacherIds = data.map((c) => c.teacher_id).filter(Boolean) as string[]
  const teacherMap: Record<string, { id: string; full_name: string }> = {}

  if (teacherIds.length > 0) {
    const { data: teachers } = await supabase
      .from('users')
      .select('id, full_name')
      .in('id', teacherIds)
    teachers?.forEach((t) => { teacherMap[t.id] = t })
  }

  return data.map((c) => ({
    ...c,
    teacher: c.teacher_id ? (teacherMap[c.teacher_id] ?? null) : null,
  }))
}

export async function getClassroom(classroomId: string): Promise<ClassroomWithTeacher | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('id', classroomId)
    .single()

  if (error || !data) return null

  let teacher: { id: string; full_name: string } | null = null
  if (data.teacher_id) {
    const { data: t } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('id', data.teacher_id)
      .single()
    teacher = t ?? null
  }

  return { ...data, teacher }
}

export async function getClassroomStudents(classroomId: string): Promise<Student[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('full_name', { ascending: true })

  if (error) return []
  return data ?? []
}

export async function getTeacherClassrooms(teacherId: string): Promise<ClassroomWithCount[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('name', { ascending: true })

  if (error || !data) return []

  // Get student counts
  const counts = await Promise.all(
    data.map((c) =>
      supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('classroom_id', c.id)
        .then(({ count }) => ({ id: c.id, count: count ?? 0 }))
    )
  )
  const countMap: Record<string, number> = {}
  counts.forEach((c) => { countMap[c.id] = c.count })

  return data.map((c) => ({
    ...c,
    students: [{ count: countMap[c.id] ?? 0 }],
  }))
}
