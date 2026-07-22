import { createClient } from '@/lib/supabase/server'
import { getClassroom, getClassroomStudents } from '@/lib/queries/classrooms'
import { PageHeader } from '@/components/shared/PageHeader'
import { AttendanceSheet } from '@/components/attendance/AttendanceSheet'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { todayISO } from '@/lib/utils'
import type { AttendanceStatus } from '@/types/database'
import { AttendanceDatePicker } from '@/components/attendance/AttendanceDatePicker'
import {
  AttendanceHistory,
  type AttendanceDaySummary,
} from '@/components/attendance/AttendanceHistory'
import { CalendarDays } from 'lucide-react'

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
  if (classroom.teacher_id !== user.id) notFound()

  // Fetch attendance for the selected date + full history for this classroom
  const [{ data: existingAttendance }, { data: allAttendance }] = await Promise.all([
    supabase
      .from('attendance')
      .select('student_id, status')
      .eq('classroom_id', id)
      .eq('date', date),
    supabase
      .from('attendance')
      .select('date, status')
      .eq('classroom_id', id)
      .order('date', { ascending: false }),
  ])

  const existingRecords: Record<string, AttendanceStatus> = {}
  existingAttendance?.forEach((r) => {
    existingRecords[r.student_id] = r.status as AttendanceStatus
  })

  // Group history into per-day summaries
  const dayMap = new Map<string, AttendanceDaySummary>()
  allAttendance?.forEach((r) => {
    const entry = dayMap.get(r.date) ?? { date: r.date, present: 0, absent: 0, late: 0 }
    if (r.status === 'present') entry.present++
    else if (r.status === 'absent') entry.absent++
    else if (r.status === 'late') entry.late++
    dayMap.set(r.date, entry)
  })
  const markedDays = Array.from(dayMap.values())

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
        action={<AttendanceDatePicker date={date} today={today} />}
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

      {/* Marked days history */}
      <section className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="h-4 w-4 text-primary" />
          <h2 className="font-display font-semibold text-xl">Marked days</h2>
          <span className="text-sm text-muted-foreground">
            — every date with attendance on record
          </span>
        </div>
        <AttendanceHistory
          classroomId={id}
          days={markedDays}
          selectedDate={date}
          today={today}
        />
      </section>
    </div>
  )
}
