import { createClient } from '@/lib/supabase/server'
import {
  getChildrenOfParent,
  getPublishedReportsForChildren,
} from '@/lib/queries/kcolos'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, ArrowRight } from 'lucide-react'

export const metadata = { title: 'Reports' }

export default async function ParentReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const children = await getChildrenOfParent(user.id)
  const reports = await getPublishedReportsForChildren(children.map((c) => c.id))

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Every report is prepared with your child's teacher and includes practical ways to help at home."
      />

      {reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No reports yet"
          description="When your child's teacher publishes a report, it will appear here with reinforcement suggestions and resources."
        />
      ) : (
        <div className="space-y-3 stagger-children">
          {reports.map((report) => (
            <Link
              key={report.id}
              href={`/parent/reports/${report.id}`}
              className="group flex items-center gap-4 bg-card rounded-2xl border border-border p-5 shadow-xs hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">
                  {report.student?.full_name} — {report.term}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {report.summary ?? 'Performance report'}
                </p>
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block">
                {report.published_at
                  ? new Date(report.published_at).toLocaleDateString('en-GB')
                  : ''}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
