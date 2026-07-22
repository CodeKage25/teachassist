'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { AttendanceStatus } from '@/types/database'

export async function recordAttendance(
  classroomId: string,
  date: string,
  records: { studentId: string; status: AttendanceStatus }[]
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const rows = records.map((r) => ({
    student_id: r.studentId,
    classroom_id: classroomId,
    date,
    status: r.status,
    recorded_by: user.id,
  }))

  const { error } = await supabase
    .from('attendance')
    .upsert(rows, { onConflict: 'student_id,classroom_id,date' })

  if (error) return { error: error.message }

  revalidatePath(`/teacher/classrooms/${classroomId}/attendance`)
  return { success: true }
}

export async function deleteAttendanceForDate(classroomId: string, date: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Only the classroom's assigned teacher may erase a day's records
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('teacher_id')
    .eq('id', classroomId)
    .single()

  if (!classroom || classroom.teacher_id !== user.id) {
    return { error: 'You are not assigned to this classroom' }
  }

  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('classroom_id', classroomId)
    .eq('date', date)

  if (error) return { error: error.message }

  revalidatePath(`/teacher/classrooms/${classroomId}/attendance`)
  return { success: true }
}
