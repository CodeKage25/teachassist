'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendMessage(content: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('users')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) return { error: 'No school associated' }
  if (!['admin', 'teacher'].includes(profile.role)) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase.from('messages').insert({
    school_id: profile.school_id,
    sender_id: user.id,
    content: content.trim(),
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/messages')
  revalidatePath('/teacher/messages')
  return { success: true }
}

export async function deleteMessage(messageId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)

  if (error) return { error: error.message }

  revalidatePath('/admin/messages')
  revalidatePath('/teacher/messages')
  return { success: true }
}
