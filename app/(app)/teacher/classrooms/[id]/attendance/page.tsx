import { createClient } from '@/lib/supabase/server'
import { getClassroom, getClassroomStudents } from '@/lib/queries/classrooms'
import { PageHeader } from '@/components/shared/PageHeader'
import { AttendanceSheet } from '@/components/attendance/AttendanceSheet'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { todayISO } from '@/lib/utils'
import type { AttendanceStatus } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ date?: string }>
}

export default async function AttendancePage({ params, searchParams }: Props) {
  const { id } = await params
  const { date: dateParam } = await searchParams
  const date = dateParam ?? todayISO()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [classroom, students] = await Promise.all([
    getClassroom(id),
    getClassroomStudents(id),
  ])

  if (!classroom) notFound()

  // Fetch existing attendance for selected date
  const { data: existingAttendance } = await supabase
    .from('attendance')
    .select('student_id, status')
    .eq('classroom_id', id)
    .eq('date', date)

  const existingRecords: Record<string, AttendanceStatus> = {}
  existingAttendance?.forEach((r) => {
    existingRecords[r.student_id] = r.status as AttendanceStatus
  })

  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/teacher/classrooms/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {classroom.name}
        </Link>
      </div>

      <PageHeader
        title="Attendance"
        description={`${classroom.name} — ${date === today ? 'Today' : date}`}
        action={
          <form className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Date:</label>
            <input
              type="date"
              name="date"
              defaultValue={date}
              max={today}
              className="h-9 rounded-lg border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                const url = new URL(window.location.href)
                url.searchParams.set('date', e.target.value)
                window.location.href = url.toString()
              }}
            />
          </form>
        }
      />

      {students.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No students enrolled in this classroom.
        </div>
      ) : (
        <AttendanceSheet
          classroomId={id}
          students={students}
          date={date}
          existingRecords={existingRecords}
        />
      )}
    </div>
  )
}
