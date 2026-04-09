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
    const age = formData.get('age') ? Number(formData.get('age')) : null
    const parentName = formData.get('parent_name') as string | null
    const parentPhone = formData.get('parent_phone') as string | null
    const bio = formData.get('bio') as string | null

    const { error } = await supabase.from('students').insert({
      full_name: fullName,
      school_id: schoolId,
      classroom_id: classroomId || null,
      age: age || null,
      parent_name: parentName || null,
      parent_phone: parentPhone || null,
      bio: bio || null,
    })

    if (error) return { error: error.message }

    revalidatePath('/admin/students')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function addStudentAsTeacher(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
      .from('users')
      .select('school_id, role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'teacher') throw new Error('Unauthorized')
    if (!profile.school_id) throw new Error('No school assigned')

    const classroomId = formData.get('classroom_id') as string
    const fullName = formData.get('full_name') as string
    const age = formData.get('age') ? Number(formData.get('age')) : null
    const parentName = formData.get('parent_name') as string | null
    const parentPhone = formData.get('parent_phone') as string | null
    const bio = formData.get('bio') as string | null

    const { error } = await supabase.from('students').insert({
      full_name: fullName,
      school_id: profile.school_id,
      classroom_id: classroomId,
      age: age || null,
      parent_name: parentName || null,
      parent_phone: parentPhone || null,
      bio: bio || null,
    })

    if (error) return { error: error.message }

    revalidatePath(`/teacher/classrooms/${classroomId}`)
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

export async function uploadStudentPhoto(formData: FormData) {
  try {
    const { supabase, schoolId } = await getAdminContext()

    const studentId = formData.get('student_id') as string
    const file = formData.get('photo') as File
    if (!file || file.size === 0) return { error: 'No file provided' }

    const fileExt = file.name.split('.').pop()
    const filePath = `${schoolId}/${studentId}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('student-photos')
      .upload(filePath, file, { upsert: true })

    if (uploadError) return { error: uploadError.message }

    const { data: { publicUrl } } = supabase.storage
      .from('student-photos')
      .getPublicUrl(filePath)

    const { error } = await supabase
      .from('students')
      .update({ photo_url: publicUrl })
      .eq('id', studentId)

    if (error) return { error: error.message }

    revalidatePath(`/admin/students/${studentId}`)
    return { success: true, url: publicUrl }
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
