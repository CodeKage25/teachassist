'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getAdminContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('users')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Unauthorized')
  return { supabase, user, schoolId: profile.school_id! }
}

export async function addStudent(formData: FormData) {
  try {
    const { supabase, schoolId } = await getAdminContext()

    const fullName = formData.get('full_name') as string
    const classroomId = formData.get('classroom_id') as string

    const { error } = await supabase.from('students').insert({
      full_name: fullName,
      school_id: schoolId,
      classroom_id: classroomId || null,
    })

    if (error) return { error: error.message }

    revalidatePath('/admin/students')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function updateStudent(
  studentId: string,
  data: { full_name?: string; classroom_id?: string | null }
) {
  try {
    const { supabase } = await getAdminContext()

    const { error } = await supabase
      .from('students')
      .update(data)
      .eq('id', studentId)

    if (error) return { error: error.message }

    revalidatePath('/admin/students')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function deleteStudent(studentId: string) {
  try {
    const { supabase } = await getAdminContext()

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId)

    if (error) return { error: error.message }

    revalidatePath('/admin/students')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
