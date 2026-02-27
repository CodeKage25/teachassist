import { createClient } from '@/lib/supabase/server'
import type { Message } from '@/types/database'

export type MessageWithSender = Message & {
  sender: { id: string; full_name: string; role: string } | null
}

export async function getMessages(schoolId: string): Promise<MessageWithSender[]> {
  const supabase = await createClient()

  const { data: rawData, error } = await supabase
    .from('messages')
    .select('*')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: true })

  const data = rawData as Message[] | null
  if (error || !data) return []

  // Fetch senders separately
  const senderIds = [...new Set(data.map((m) => m.sender_id))]
  const { data: rawUsers } = await supabase
    .from('users')
    .select('id, full_name, role')
    .in('id', senderIds)

  const users = rawUsers as { id: string; full_name: string; role: string }[] | null
  const userMap: Record<string, { id: string; full_name: string; role: string }> = {}
  users?.forEach((u) => { userMap[u.id] = u })

  return data.map((m) => ({
    ...m,
    sender: userMap[m.sender_id] ?? null,
  }))
}
