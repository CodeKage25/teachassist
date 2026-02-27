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

export async function createClassroom(formData: FormData) {
  try {
    const { supabase, schoolId } = await getAdminContext()

    const name = formData.get('name') as string

    const { error } = await supabase
      .from('classrooms')
      .insert({ name, school_id: schoolId })

    if (error) return { error: error.message }

    revalidatePath('/admin/classrooms')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function updateClassroom(
  classroomId: string,
  data: { name?: string; teacher_id?: string | null }
) {
  try {
    const { supabase } = await getAdminContext()

    const { error } = await supabase
      .from('classrooms')
      .update(data)
      .eq('id', classroomId)

    if (error) return { error: error.message }

    revalidatePath('/admin/classrooms')
    revalidatePath(`/admin/classrooms/${classroomId}`)
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function deleteClassroom(classroomId: string) {
  try {
    const { supabase } = await getAdminContext()

    const { error } = await supabase
      .from('classrooms')
      .delete()
      .eq('id', classroomId)

    if (error) return { error: error.message }

    revalidatePath('/admin/classrooms')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
