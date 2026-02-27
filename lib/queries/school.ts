import { createClient } from '@/lib/supabase/server'

export async function getSchool() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) return null

  const { data } = await supabase
    .from('schools')
    .select('*')
    .eq('id', profile.school_id)
    .single()

  return data
}

export async function getSchoolMetrics(schoolId: string) {
  const supabase = await createClient()

  const [teachers, students, classrooms] = await Promise.all([
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('role', 'teacher'),
    supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId),
    supabase
      .from('classrooms')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId),
  ])

  return {
    teacherCount: teachers.count ?? 0,
    studentCount: students.count ?? 0,
    classroomCount: classrooms.count ?? 0,
  }
}
