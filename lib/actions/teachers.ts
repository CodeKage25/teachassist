'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { generatePassword } from '@/lib/utils'

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

export async function inviteTeacher(formData: FormData) {
  try {
    const { schoolId } = await getAdminContext()
    const adminClient = createAdminClient()

    const email = formData.get('email') as string
    const fullName = formData.get('full_name') as string
    const password = generatePassword(12)

    const { error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'teacher',
        school_id: schoolId,
      },
    })

    if (error) return { error: error.message }

    revalidatePath('/admin/teachers')
    return { success: true, email, password }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function updateTeacher(
  teacherId: string,
  data: { full_name?: string; is_active?: boolean; classroom_id?: string | null }
) {
  try {
    const { supabase } = await getAdminContext()

    const { error } = await supabase
      .from('users')
      .update({ ...data })
      .eq('id', teacherId)

    if (error) return { error: error.message }

    // If assigning to classroom, update classroom's teacher_id
    if (data.classroom_id !== undefined) {
      // First, unassign teacher from any existing classroom
      await supabase
        .from('classrooms')
        .update({ teacher_id: null })
        .eq('teacher_id', teacherId)

      // Then assign to new classroom if provided
      if (data.classroom_id) {
        await supabase
          .from('classrooms')
          .update({ teacher_id: teacherId })
          .eq('id', data.classroom_id)
      }
    }

    revalidatePath('/admin/teachers')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function toggleTeacherStatus(teacherId: string, isActive: boolean) {
  try {
    const { supabase } = await getAdminContext()

    const { error } = await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('id', teacherId)

    if (error) return { error: error.message }

    revalidatePath('/admin/teachers')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
