import { createClient } from '@/lib/supabase/server'
import { getReport } from '@/lib/queries/kcolos'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { ReportFocusArea } from '@/types/database'
import {
  ChevronLeft,
  Sparkles,
  Star,
  Home,
  Youtube,
  BookOpen,
  PencilRuler,
  Quote,
  ExternalLink,
} from 'lucide-react'

export const metadata = { title: 'Report' }

export default async function ParentReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // RLS guarantees parents only ever receive published reports for their children
  const report = await getReport(id)
  if (!report) notFound()

  const strengths = Array.isArray(report.strengths) ? (report.strengths as string[]) : []
  const focusAreas = Array.isArray(report.focus_areas)
    ? (report.focus_areas as unknown as ReportFocusArea[])
    : []

  return (
    <div className="space-y-6">
      <Link
        href="/parent/reports"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        All reports
      </Link>

      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-chart-4 text-primary-foreground p-8 shadow-lg shadow-primary/20">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-grid opacity-[0.06]" />
          <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative">
          <Badge className="bg-white/15 text-primary-foreground border-0 mb-3">
            {report.term}
          </Badge>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {report.student?.full_name}
          </h1>
          {report.published_at && (
            <p className="text-primary-foreground/70 text-sm mt-1.5">
              Published {new Date(report.published_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
      </section>

      {/* Summary */}
      {report.summary && (
        <section className="bg-card rounded-2xl border border-border p-6 shadow-xs">
          <h2 className="flex items-center gap-2 font-bold text-base mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            How {report.student?.full_name?.split(' ')[0]} is doing
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">{report.summary}</p>
        </section>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <section className="bg-card rounded-2xl border border-border p-6 shadow-xs">
          <h2 className="flex items-center gap-2 font-bold text-base mb-4">
            <Star className="h-4 w-4 text-warning" />
            Strengths
          </h2>
          <ul className="space-y-2.5">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-success flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Focus areas */}
      {focusAreas.map((fa, i) => (
        <section
          key={i}
          className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-4"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Where to focus
            </p>
            <h2 className="font-bold text-base">{fa.area}</h2>
            {fa.observation && (
              <p className="text-sm text-muted-foreground mt-1">{fa.observation}</p>
            )}
          </div>

          {fa.home_support && (
            <div className="rounded-xl bg-accent/60 border border-primary/15 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-accent-foreground uppercase tracking-wider mb-1.5">
                <Home className="h-3.5 w-3.5" />
                How you can help at home
              </p>
              <p className="text-sm leading-relaxed text-foreground/80">{fa.home_support}</p>
            </div>
          )}

          {fa.resources?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Suggested resources
              </p>
              <div className="space-y-2">
                {fa.resources.map((res, ri) => {
                  const icon =
                    res.type === 'youtube' ? (
                      <Youtube className="h-4 w-4 text-destructive flex-shrink-0" />
                    ) : res.type === 'reading' ? (
                      <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                    ) : (
                      <PencilRuler className="h-4 w-4 text-warning flex-shrink-0" />
                    )
                  const inner = (
                    <>
                      {icon}
                      <span className="flex-1 text-sm">{res.title}</span>
                      {res.url && (
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </>
                  )
                  return res.url ? (
                    <a
                      key={ri}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-border px-4 py-2.5 hover:border-primary/30 hover:bg-muted/30 transition-colors"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div
                      key={ri}
                      className="flex items-center gap-3 rounded-xl border border-border px-4 py-2.5"
                    >
                      {inner}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      ))}

      {/* Teacher note */}
      {report.teacher_note && (
        <section className="bg-card rounded-2xl border border-border p-6 shadow-xs">
          <h2 className="flex items-center gap-2 font-bold text-base mb-3">
            <Quote className="h-4 w-4 text-primary" />
            A note from the teacher
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80 italic">
            {report.teacher_note}
          </p>
        </section>
      )}
    </div>
  )
}
