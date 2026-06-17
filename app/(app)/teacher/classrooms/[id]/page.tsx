import { createClient } from '@/lib/supabase/server'
import { getClassroom, getClassroomStudents } from '@/lib/queries/classrooms'
import { PageHeader } from '@/components/shared/PageHeader'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ClipboardCheck, ArrowLeft } from 'lucide-react'
import { TeacherClassroomActions } from '@/components/teacher/TeacherClassroomActions'
import { ClassroomLMS } from '@/components/teacher/ClassroomLMS'

interface Props {
  params: Promise<{ id: string }>
}

export default async function TeacherClassroomPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [classroom, students] = await Promise.all([
    getClassroom(id),
    getClassroomStudents(id),
  ])

  if (!classroom) notFound()

  const studentList = students.map((s) => ({
    id: s.id,
    name: s.full_name,
  }))

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/teacher"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to my classes
        </Link>
      </div>

      <PageHeader
        title={classroom.name}
        description={`${students.length} student${students.length !== 1 ? 's' : ''} enrolled`}
        action={
          <div className="flex items-center gap-3">
            <TeacherClassroomActions classroomId={id} classroomName={classroom.name} />
            <Button
              className="bg-blue-700 hover:bg-blue-800 text-white cursor-pointer"
              asChild
            >
              <Link href={`/teacher/classrooms/${id}/attendance`}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Take Attendance
              </Link>
            </Button>
          </div>
        }
      />

      <ClassroomLMS
        classroomId={id}
        classroomName={classroom.name}
        students={studentList}
      />
    </div>
  )
}
