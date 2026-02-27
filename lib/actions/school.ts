'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createSchool(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = formData.get('name') as string
  const location = formData.get('location') as string
  const contactEmail = formData.get('contact_email') as string

  const { data: school, error } = await supabase
    .from('schools')
    .insert({
      name,
      location: location || null,
      contact_email: contactEmail || null,
      admin_id: user.id,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Update user's school_id
  await supabase
    .from('users')
    .update({ school_id: school.id })
    .eq('id', user.id)

  redirect('/admin')
}

export async function updateSchool(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('users')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) return { error: 'No school found' }

  const name = formData.get('name') as string
  const location = formData.get('location') as string
  const contactEmail = formData.get('contact_email') as string

  const { error } = await supabase
    .from('schools')
    .update({
      name,
      location: location || null,
      contact_email: contactEmail || null,
    })
    .eq('id', profile.school_id)

  if (error) return { error: error.message }

  revalidatePath('/admin/settings')
  return { success: true }
}

export async function uploadLogo(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('users')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) return { error: 'No school found' }

  const file = formData.get('logo') as File
  if (!file || file.size === 0) return { error: 'No file provided' }

  const fileExt = file.name.split('.').pop()
  const filePath = `${profile.school_id}/logo.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('school-logos')
    .upload(filePath, file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  const {
    data: { publicUrl },
  } = supabase.storage.from('school-logos').getPublicUrl(filePath)

  await supabase
    .from('schools')
    .update({ logo_url: publicUrl })
    .eq('id', profile.school_id)

  revalidatePath('/admin/settings')
  return { success: true, url: publicUrl }
}
