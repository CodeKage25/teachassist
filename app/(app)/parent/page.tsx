import { createClient } from '@/lib/supabase/server'
import {
  getChildrenOfParent,
  getPublishedReportsForChildren,
  getStudentAttendanceSummary,
} from '@/lib/queries/kcolos'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { getGreeting } from '@/lib/utils'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  GraduationCap,
  FileText,
  ArrowRight,
  CalendarCheck,
} from 'lucide-react'

export const metadata = { title: 'Parent Dashboard' }

export default async function ParentOverviewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const children = await getChildrenOfParent(user.id)
  const [reports, attendanceSummaries] = await Promise.all([
    getPublishedReportsForChildren(children.map((c) => c.id)),
    Promise.all(children.map((c) => getStudentAttendanceSummary(c.id))),
  ])

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${getGreeting()}, ${profile?.full_name?.split(' ')[0] ?? 'there'}`}
        description="Follow your child's learning journey — reports here are prepared and reviewed by their teacher."
      />

      {children.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No children linked yet"
          description="Your school will link your children to this account. If you expected to see them here, contact the school administrator."
        />
      ) : (
        <>
          {/* Children */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
            {children.map((child, i) => {
              const att = attendanceSummaries[i]
              const totalDays = att.present + att.absent + att.late
              const rate = totalDays > 0 ? Math.round((att.present / totalDays) * 100) : null
              const childReports = reports.filter((r) => r.student_id === child.id)
              return (
                <div
                  key={child.id}
                  className="bg-card rounded-2xl border border-border p-6 shadow-xs"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{child.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {child.classroom?.name ?? 'Not in a classroom yet'}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <CalendarCheck className="h-4 w-4" />
                      {rate !== null ? `${rate}% attendance` : 'No attendance yet'}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      {childReports.length} report{childReports.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Latest reports */}
          <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-bold text-base">Latest reports</h2>
              <Link
                href="/parent/reports"
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                View all
              </Link>
            </div>
            {reports.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                No published reports yet. Your child&apos;s teacher will publish termly
                reports with practical suggestions for supporting learning at home.
              </p>
            ) : (
              <div className="divide-y divide-border/60">
                {reports.slice(0, 4).map((report) => (
                  <Link
                    key={report.id}
                    href={`/parent/reports/${report.id}`}
                    className="group flex items-center gap-3 px-6 py-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {report.student?.full_name} — {report.term}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {report.summary ?? 'Performance report'}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                      Published
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
