import { createClient } from '@/lib/supabase/server'
import type { Student } from '@/types/database'

export type StudentWithClassroom = Student & {
  classroom: { id: string; name: string } | null
}

export async function getStudents(schoolId: string): Promise<StudentWithClassroom[]> {
  const supabase = await createClient()

  const { data: rawData, error } = await supabase
    .from('students')
    .select('*')
    .eq('school_id', schoolId)
    .order('full_name', { ascending: true })

  const data = rawData as Student[] | null
  if (error || !data) return []

  const classroomIds = [...new Set(data.map((s) => s.classroom_id).filter(Boolean))] as string[]
  const classroomMap: Record<string, { id: string; name: string }> = {}

  if (classroomIds.length > 0) {
    const { data: cls } = await supabase
      .from('classrooms')
      .select('id, name')
      .in('id', classroomIds)
    const typedCls = cls as { id: string; name: string }[] | null
    typedCls?.forEach((c) => { classroomMap[c.id] = c })
  }

  return data.map((s) => ({
    ...s,
    classroom: s.classroom_id ? (classroomMap[s.classroom_id] ?? null) : null,
  }))
}

export async function getStudent(studentId: string): Promise<StudentWithClassroom | null> {
  const supabase = await createClient()

  const { data: rawData, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single()

  const data = rawData as Student | null
  if (error || !data) return null

  let classroom: { id: string; name: string } | null = null
  if (data.classroom_id) {
    const { data: cls } = await supabase
      .from('classrooms')
      .select('id, name')
      .eq('id', data.classroom_id)
      .single()
    classroom = (cls as { id: string; name: string } | null) ?? null
  }

  return { ...data, classroom }
}
