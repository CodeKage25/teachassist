import { createClient } from '@/lib/supabase/server'
import { getClassroom, getClassroomStudents } from '@/lib/queries/classrooms'
import { getTeachers } from '@/lib/queries/teachers'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/badge'
import { ClassroomDetailClient } from './ClassroomDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClassroomDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profileData } = await supabase
    .from('users').select('school_id').eq('id', user.id).single()
  const schoolId = (profileData as { school_id: string | null } | null)?.school_id

  const [classroom, students, teachers] = await Promise.all([
    getClassroom(id),
    getClassroomStudents(id),
    schoolId ? getTeachers(schoolId) : [],
  ])

  if (!classroom) return notFound()

  const classroomProp = {
    id: classroom.id,
    name: classroom.name,
    teacher_id: classroom.teacher_id,
  }

  const studentsProp = students.map((s) => ({
    id: s.id,
    full_name: s.full_name,
    created_at: s.created_at,
  }))

  const teachersProp = teachers.map((t) => ({
    id: t.id,
    full_name: t.full_name,
  }))

  return (
    <div>
      <PageHeader
        title={classroom.name}
        description={
          classroom.teacher
            ? `Teacher: ${classroom.teacher.full_name}`
            : 'No teacher assigned'
        }
        action={
          <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-0">
            {students.length} student{students.length !== 1 ? 's' : ''}
          </Badge>
        }
      />
      <ClassroomDetailClient
        classroom={classroomProp}
        students={studentsProp}
        teachers={teachersProp}
      />
    </div>
  )
}
