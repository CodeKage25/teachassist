'use client'

import { useState } from 'react'
import { MessagesClient } from '@/components/messages/MessagesClient'
import { DirectMessagesClient } from '@/components/messages/DirectMessagesClient'
import { cn } from '@/lib/utils'
import type { MessageWithSender } from '@/lib/queries/messages'

interface StaffMember {
  id: string
  full_name: string
  role: string
}

interface MessagesTabsClientProps {
  initialMessages: MessageWithSender[]
  currentUserId: string
  currentUserName: string
  currentUserRole: string
  schoolId: string
  staff: StaffMember[]
}

export function MessagesTabsClient({
  initialMessages,
  currentUserId,
  currentUserName,
  currentUserRole,
  schoolId,
  staff,
}: MessagesTabsClientProps) {
  const [tab, setTab] = useState<'group' | 'direct'>('group')

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-0">
      {/* Tab bar */}
      <div className="flex border-b border-border bg-white rounded-t-2xl overflow-hidden">
        <button
          onClick={() => setTab('group')}
          className={cn(
            'flex-1 py-3 text-sm font-medium transition-colors cursor-pointer',
            tab === 'group'
              ? 'text-blue-700 border-b-2 border-blue-700 bg-blue-50/50'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          Group Channel
        </button>
        <button
          onClick={() => setTab('direct')}
          className={cn(
            'flex-1 py-3 text-sm font-medium transition-colors cursor-pointer',
            tab === 'direct'
              ? 'text-blue-700 border-b-2 border-blue-700 bg-blue-50/50'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          Direct Messages
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {tab === 'group' ? (
          <MessagesClient
            initialMessages={initialMessages}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserRole={currentUserRole}
            schoolId={schoolId}
          />
        ) : (
          <DirectMessagesClient
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            schoolId={schoolId}
            staff={staff}
          />
        )}
      </div>
    </div>
  )
}
