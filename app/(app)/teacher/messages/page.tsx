import { createClient } from '@/lib/supabase/server'
import { getMessages } from '@/lib/queries/messages'
import { getSchoolStaff } from '@/lib/queries/direct-messages'
import { PageHeader } from '@/components/shared/PageHeader'
import { redirect } from 'next/navigation'
import { MessagesTabsClient } from '@/components/messages/MessagesTabsClient'

export default async function TeacherMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users').select('school_id, full_name, role').eq('id', user.id).single()
  if (!profile?.school_id) redirect('/teacher')

  const [messages, staff] = await Promise.all([
    getMessages(profile.school_id),
    getSchoolStaff(profile.school_id),
  ])

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageHeader
        title="Staff Messages"
        description="Chat with your colleagues and school administrator"
      />
      <MessagesTabsClient
        initialMessages={messages}
        currentUserId={user.id}
        currentUserName={profile.full_name}
        currentUserRole={profile.role}
        schoolId={profile.school_id}
        staff={staff}
      />
    </div>
  )
}
