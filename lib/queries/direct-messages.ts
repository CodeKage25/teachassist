import { createClient } from '@/lib/supabase/server'
import type { DirectMessageWithSender, UserProfile } from '@/types/database'

export async function getSchoolStaff(schoolId: string): Promise<Pick<UserProfile, 'id' | 'full_name' | 'role'>[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('id, full_name, role')
    .eq('school_id', schoolId)
    .order('full_name')
  return (data ?? []) as Pick<UserProfile, 'id' | 'full_name' | 'role'>[]
}

export async function getDirectMessages(
  recipientId: string
): Promise<DirectMessageWithSender[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('direct_messages')
    .select('*, sender:users!direct_messages_sender_id_fkey(id, full_name, role)')
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .or(`sender_id.eq.${recipientId},recipient_id.eq.${recipientId}`)
    .order('created_at', { ascending: true })

  // Filter to only the conversation between current user and recipient
  const messages = (data ?? []).filter(
    (m: any) =>
      (m.sender_id === user.id && m.recipient_id === recipientId) ||
      (m.sender_id === recipientId && m.recipient_id === user.id)
  )

  return messages as DirectMessageWithSender[]
}
