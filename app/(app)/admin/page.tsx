import { createClient } from '@/lib/supabase/server'
import { getSchool, getSchoolMetrics } from '@/lib/queries/school'
import { MetricCard } from '@/components/shared/MetricCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { redirect } from 'next/navigation'
import { Users, GraduationCap, School, MessageSquare } from 'lucide-react'
import { getMessages } from '@/lib/queries/messages'
import { formatDateTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AIInsightsWidget } from '@/components/shared/AIInsightsWidget'

export default async function AdminOverviewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) redirect('/setup')

  const [school, metrics, recentMessages] = await Promise.all([
    getSchool(),
    getSchoolMetrics(profile.school_id),
    getMessages(profile.school_id),
  ])

  const latestMessages = recentMessages.slice(-3).reverse()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome back 👋"
        description={school ? `${school.name} — Admin Dashboard` : 'Admin Dashboard'}
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Teachers"
          value={metrics.teacherCount}
          icon={Users}
          color="blue"
          description="Active teaching staff"
        />
        <MetricCard
          title="Total Students"
          value={metrics.studentCount}
          icon={GraduationCap}
          color="teal"
          description="Enrolled students"
        />
        <MetricCard
          title="Classrooms"
          value={metrics.classroomCount}
          icon={School}
          color="slate"
          description="Active classrooms"
        />
        <MetricCard
          title="Messages"
          value={recentMessages.length}
          icon={MessageSquare}
          color="blue"
          description="Staff communications"
        />
      </div>

      {/* Recent Messages */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="font-bold text-base text-slate-900">Recent Messages</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/messages" className="text-blue-700 hover:text-blue-800 text-sm">
              View all
            </Link>
          </Button>
        </div>
        {latestMessages.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-400 text-sm">
            No messages yet. Start a conversation with your staff.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {latestMessages.map((msg) => {
              const sender = msg.sender as { full_name: string; role: string } | null
              return (
                <div key={msg.id} className="px-6 py-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                    {(sender?.full_name ?? 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-slate-800">
                        {sender?.full_name ?? 'Unknown'}
                      </span>
                      <Badge variant="secondary" className="text-xs capitalize h-4 px-1.5">
                        {sender?.role}
                      </Badge>
                      <span className="text-xs text-slate-400 ml-auto">
                        {formatDateTime(msg.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate">{msg.content}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* AI Insights */}
      <AIInsightsWidget schoolId={profile.school_id} />

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/teachers"
          className="block bg-white rounded-xl border border-slate-200 p-4 text-sm font-semibold text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition-all"
        >
          Add a teacher →
        </Link>
        <Link
          href="/admin/classrooms"
          className="block bg-white rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          Create a classroom →
        </Link>
        <Link
          href="/admin/students"
          className="block bg-white rounded-xl border border-slate-200 p-4 text-sm font-semibold text-teal-700 hover:bg-teal-50 hover:border-teal-200 transition-all"
        >
          Enroll students →
        </Link>
      </div>
    </div>
  )
}
