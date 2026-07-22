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

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-1">{today}</p>
        <PageHeader
          title="Welcome back 👋"
          description={school ? `${school.name} — Admin Dashboard` : 'Admin Dashboard'}
        />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
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
      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-base text-foreground">Recent Messages</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/messages" className="text-primary hover:text-primary/80 text-sm">
              View all
            </Link>
          </Button>
        </div>
        {latestMessages.length === 0 ? (
          <div className="px-6 py-8 text-center text-muted-foreground text-sm">
            No messages yet. Start a conversation with your staff.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {latestMessages.map((msg) => {
              const sender = msg.sender as { full_name: string; role: string } | null
              return (
                <div key={msg.id} className="px-6 py-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-foreground">
                    {(sender?.full_name ?? 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-foreground">
                        {sender?.full_name ?? 'Unknown'}
                      </span>
                      <Badge variant="secondary" className="text-xs capitalize h-4 px-1.5">
                        {sender?.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDateTime(msg.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{msg.content}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* AI Insights */}
      <AIInsightsWidget schoolId={profile.school_id} />

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            href: '/admin/teachers',
            label: 'Add a teacher',
            hint: 'Invite staff by email',
            icon: Users,
            chip: 'bg-primary/10 text-primary',
          },
          {
            href: '/admin/classrooms',
            label: 'Create a classroom',
            hint: 'Set up a new class',
            icon: School,
            chip: 'bg-muted text-muted-foreground',
          },
          {
            href: '/admin/students',
            label: 'Enroll students',
            hint: 'Add students to a class',
            icon: GraduationCap,
            chip: 'bg-success/10 text-success',
          },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-center gap-4 bg-card rounded-2xl border border-border p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-300"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${action.chip}`}
            >
              <action.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.hint}</p>
            </div>
            <span className="text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
