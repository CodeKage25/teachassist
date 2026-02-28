import { createClient } from '@/lib/supabase/server'
import { getClassroom, getClassroomStudents } from '@/lib/queries/classrooms'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ClipboardCheck, GraduationCap, ArrowLeft } from 'lucide-react'
import { TeacherClassroomActions } from '@/components/teacher/TeacherClassroomActions'

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
            <TeacherClassroomActions classroomId={id} />
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

      {students.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No students yet"
          description="Add students to this classroom or ask your administrator to enroll them."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="font-semibold">#</TableHead>
                <TableHead className="font-semibold">Student Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student, i) => (
                <TableRow key={student.id} className="hover:bg-slate-50/50">
                  <TableCell className="text-muted-foreground text-sm font-mono w-12">
                    {String(i + 1).padStart(2, '0')}
                  </TableCell>
                  <TableCell className="font-medium">{student.full_name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
