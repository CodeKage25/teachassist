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
