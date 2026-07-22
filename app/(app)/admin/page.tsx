import { createClient } from '@/lib/supabase/server'
import { getSchool, getSchoolMetrics } from '@/lib/queries/school'
import { MetricCard } from '@/components/shared/MetricCard'
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
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-chart-4 text-primary-foreground p-8 sm:p-10 shadow-lg shadow-primary/20">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-grid opacity-[0.06]" />
          <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-float-slow" />
          <div className="absolute inset-0 bg-noise opacity-[0.05]" />
        </div>
        <div className="relative">
          <p className="text-sm font-medium text-primary-foreground/70">{today}</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mt-1.5">
            Welcome back 👋
          </h1>
          <p className="text-primary-foreground/80 mt-2 text-sm sm:text-base">
            {school ? `${school.name} — here's what's happening at your school today.` : 'Admin Dashboard'}
          </p>
          {/* At-a-glance chips on the hero */}
          <div className="flex flex-wrap gap-2.5 mt-6">
            {[
              { label: 'teachers', value: metrics.teacherCount },
              { label: 'students', value: metrics.studentCount },
              { label: 'classrooms', value: metrics.classroomCount },
            ].map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-baseline gap-1.5 rounded-full bg-white/12 backdrop-blur border border-white/20 px-3.5 py-1.5 text-sm"
              >
                <span className="font-display font-semibold tabular">{chip.value}</span>
                <span className="text-primary-foreground/70 text-xs">{chip.label}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

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

      {/* Messages + quick actions rail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-display font-semibold text-lg text-foreground">Recent Messages</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/messages" className="text-primary hover:text-primary/80 text-sm">
                View all
              </Link>
            </Button>
          </div>
          {latestMessages.length === 0 ? (
            <div className="px-6 py-10 text-center text-muted-foreground text-sm">
              No messages yet. Start a conversation with your staff.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {latestMessages.map((msg) => {
                const sender = msg.sender as { full_name: string; role: string } | null
                return (
                  <div
                    key={msg.id}
                    className="px-6 py-4 flex items-start gap-3 transition-colors duration-200 hover:bg-muted/40"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-foreground shadow-sm shadow-primary/20">
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

        {/* Quick actions rail */}
        <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-display font-semibold text-lg text-foreground">Quick actions</h2>
          </div>
          <div className="p-3 space-y-1.5">
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
                chip: 'bg-chart-4/10 text-chart-4',
              },
              {
                href: '/admin/students',
                label: 'Enroll students',
                hint: 'Add students to a class',
                icon: GraduationCap,
                chip: 'bg-success/10 text-success',
              },
              {
                href: '/admin/messages',
                label: 'Message your staff',
                hint: 'Broadcast an update',
                icon: MessageSquare,
                chip: 'bg-warning/15 text-warning-foreground',
              },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-3.5 rounded-xl p-3 transition-all duration-200 hover:bg-muted/60"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${action.chip}`}
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
      </div>

      {/* AI Insights */}
      <AIInsightsWidget schoolId={profile.school_id} />
    </div>
  )
}
