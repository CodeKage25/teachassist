'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendDirectMessage(formData: FormData) {
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

  const recipientId = formData.get('recipient_id') as string
  const content = (formData.get('content') as string).trim()
  if (!content) return { error: 'Message cannot be empty' }

  const { error } = await supabase.from('direct_messages').insert({
    school_id: profile.school_id,
    sender_id: user.id,
    recipient_id: recipientId,
    content,
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/messages')
  revalidatePath('/teacher/messages')
  return { success: true }
}
