'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage, deleteMessage } from '@/lib/actions/messages'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Send, Trash2, MessageSquare } from 'lucide-react'
import { cn, formatDateTime, getInitials } from '@/lib/utils'

interface MessageWithSender {
  id: string
  content: string
  created_at: string
  sender_id: string
  sender: {
    id: string
    full_name: string
    role: string
  } | null
}

interface Props {
  initialMessages: MessageWithSender[]
  currentUserId: string
  currentUserName: string
  currentUserRole: string
  schoolId: string
}

const roleColors: Record<string, string> = {
  admin: 'bg-blue-50 text-blue-700 border-0',
  teacher: 'bg-slate-100 text-slate-700 border-0',
}

export function MessagesClient({
  initialMessages,
  currentUserId,
  currentUserRole,
  schoolId,
}: Props) {
  const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedMsg, setSelectedMsg] = useState<MessageWithSender | null>(null)
  const [deleting, setDeleting] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`messages:school:${schoolId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `school_id=eq.${schoolId}`,
        },
        async (payload) => {
          // Fetch the new message with sender info
          const { data } = await supabase
            .from('messages')
            .select(`*, sender:users!messages_sender_id_fkey(id, full_name, role)`)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setMessages((prev) => [...prev, data as MessageWithSender])
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `school_id=eq.${schoolId}`,
        },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [schoolId])

  async function handleSend() {
    const text = content.trim()
    if (!text) return
    setSending(true)
    setContent('')
    const result = await sendMessage(text)
    setSending(false)
    if (result?.error) {
      toast.error(result.error)
      setContent(text)
    }
  }

  async function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      await handleSend()
    }
  }

  async function handleDelete() {
    if (!selectedMsg) return
    setDeleting(true)
    const result = await deleteMessage(selectedMsg.id)
    setDeleting(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      setDeleteOpen(false)
    }
  }

  const canDelete = (msg: MessageWithSender) =>
    msg.sender_id === currentUserId || currentUserRole === 'admin'

  return (
    <>
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-border overflow-hidden min-h-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
                <MessageSquare className="h-6 w-6 text-blue-400" />
              </div>
              <p className="font-medium text-sm">No messages yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start the conversation with your staff!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isOwn = msg.sender_id === currentUserId
                const sender = msg.sender

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex gap-3 group',
                      isOwn ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                        isOwn
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      )}
                    >
                      {getInitials(sender?.full_name ?? 'U')}
                    </div>

                    {/* Bubble */}
                    <div
                      className={cn(
                        'max-w-[75%] sm:max-w-sm',
                        isOwn ? 'items-end' : 'items-start',
                        'flex flex-col gap-1'
                      )}
                    >
                      <div
                        className={cn(
                          'flex items-center gap-2 flex-wrap',
                          isOwn ? 'flex-row-reverse' : 'flex-row'
                        )}
                      >
                        <span className="text-xs font-semibold text-foreground">
                          {isOwn ? 'You' : (sender?.full_name ?? 'Unknown')}
                        </span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-xs h-4 px-1.5 capitalize',
                            roleColors[sender?.role ?? 'teacher'] ?? roleColors.teacher
                          )}
                        >
                          {sender?.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(msg.created_at)}
                        </span>
                      </div>

                      <div
                        className={cn(
                          'flex items-end gap-2',
                          isOwn ? 'flex-row-reverse' : 'flex-row'
                        )}
                      >
                        <div
                          className={cn(
                            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                            isOwn
                              ? 'bg-blue-700 text-white rounded-tr-sm'
                              : 'bg-slate-100 text-foreground rounded-tl-sm'
                          )}
                        >
                          {msg.content}
                        </div>

                        {canDelete(msg) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              setSelectedMsg(msg)
                              setDeleteOpen(true)
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        {/* Composer */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2 items-end">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
              className="resize-none min-h-[44px] max-h-32 text-sm"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={sending || !content.trim()}
              className="bg-blue-700 hover:bg-blue-800 h-[44px] px-4 flex-shrink-0 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Message"
        description="Are you sure you want to delete this message?"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  )
}
