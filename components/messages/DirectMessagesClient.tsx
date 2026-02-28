'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendDirectMessage } from '@/lib/actions/direct-messages'
import { getInitials, formatTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Send, Loader2, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import type { DirectMessageWithSender, UserProfile } from '@/types/database'

interface StaffMember {
  id: string
  full_name: string
  role: string
}

interface DirectMessagesClientProps {
  currentUserId: string
  currentUserName: string
  schoolId: string
  staff: StaffMember[]
}

export function DirectMessagesClient({
  currentUserId,
  currentUserName,
  schoolId,
  staff,
}: DirectMessagesClientProps) {
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [messages, setMessages] = useState<DirectMessageWithSender[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const otherStaff = staff.filter((s) => s.id !== currentUserId)

  async function loadMessages(recipientId: string) {
    setLoading(true)
    const { data } = await supabase
      .from('direct_messages')
      .select('*, sender:users!direct_messages_sender_id_fkey(id, full_name, role)')
      .or(
        `and(sender_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUserId})`
      )
      .order('created_at', { ascending: true })
    setMessages((data ?? []) as DirectMessageWithSender[])
    setLoading(false)
  }

  useEffect(() => {
    if (!selectedStaff) return
    loadMessages(selectedStaff.id)

    const channel = supabase
      .channel(`dm_${[currentUserId, selectedStaff.id].sort().join('_')}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
        },
        (payload: any) => {
          const msg = payload.new as DirectMessageWithSender
          const isRelevant =
            (msg.sender_id === currentUserId && msg.recipient_id === selectedStaff.id) ||
            (msg.sender_id === selectedStaff.id && msg.recipient_id === currentUserId)
          if (isRelevant) {
            setMessages((prev) => [...prev, msg])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedStaff?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!text.trim() || !selectedStaff) return
    const formData = new FormData()
    formData.set('recipient_id', selectedStaff.id)
    formData.set('content', text.trim())
    setSending(true)
    setText('')
    const result = await sendDirectMessage(formData)
    setSending(false)
    if (result?.error) {
      toast.error(result.error)
      setText(text)
    }
  }

  return (
    <div className="flex flex-1 min-h-0 rounded-2xl border border-border overflow-hidden bg-white">
      {/* Staff list */}
      <div className="w-64 flex-shrink-0 border-r border-border flex flex-col">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Direct Messages</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {otherStaff.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8 px-4">No other staff members yet.</p>
          ) : (
            otherStaff.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelectedStaff(member)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                  selectedStaff?.id === member.id ? 'bg-blue-50 border-r-2 border-blue-700' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-slate-600">{getInitials(member.full_name)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{member.full_name}</p>
                  <p className="text-xs text-slate-400 capitalize">{member.role}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message thread */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedStaff ? (
          <>
            {/* Header */}
            <div className="px-5 py-3 border-b border-border flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="text-xs font-semibold text-slate-600">{getInitials(selectedStaff.full_name)}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{selectedStaff.full_name}</p>
                <p className="text-xs text-slate-400 capitalize">{selectedStaff.role}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 text-blue-700 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <MessageSquare className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === currentUserId
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-sm ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? 'bg-blue-700 text-white rounded-br-sm'
                              : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[11px] text-slate-400 px-1">
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Composer */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder={`Message ${selectedStaff.full_name}...`}
                  className="flex-1 h-10 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  onClick={handleSend}
                  disabled={!text.trim() || sending}
                  className="h-10 w-10 p-0 bg-blue-700 hover:bg-blue-800 text-white flex-shrink-0 cursor-pointer"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600">Select a staff member to start a private conversation</p>
            <p className="text-xs text-slate-400 mt-1">Messages are only visible to the two of you</p>
          </div>
        )}
      </div>
    </div>
  )
}
