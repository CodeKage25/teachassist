'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { draftReport, updateReport, setReportStatus } from '@/lib/actions/kcolos'
import type { ReportWithStudent } from '@/lib/queries/kcolos'
import type { ReportFocusArea, Student, StudentReport } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Sparkles,
  Loader2,
  Send,
  Undo2,
  Pencil,
  Plus,
  X,
  Youtube,
  BookOpen,
  PencilRuler,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn, getInitials } from '@/lib/utils'

interface ReportsClientProps {
  classroomId: string
  students: Pick<Student, 'id' | 'full_name'>[]
  initialReports: ReportWithStudent[]
}

function parseFocusAreas(report: StudentReport): ReportFocusArea[] {
  return Array.isArray(report.focus_areas)
    ? (report.focus_areas as unknown as ReportFocusArea[])
    : []
}

function parseStrengths(report: StudentReport): string[] {
  return Array.isArray(report.strengths) ? (report.strengths as string[]) : []
}

export function ReportsClient({
  classroomId,
  students,
  initialReports,
}: ReportsClientProps) {
  const router = useRouter()
  const [term, setTerm] = useState(
    initialReports[0]?.term ?? `Term 1 ${new Date().getFullYear()}`
  )
  const [reports, setReports] = useState(initialReports)
  const [generatingFor, setGeneratingFor] = useState<string | null>(null)
  const [editing, setEditing] = useState<ReportWithStudent | null>(null)

  const reportByStudent = new Map(
    reports.filter((r) => r.term === term).map((r) => [r.student_id, r])
  )

  async function handleGenerate(student: Pick<Student, 'id' | 'full_name'>) {
    if (!term.trim()) {
      toast.warning('Set the term first (e.g. "Term 1 2026")')
      return
    }
    setGeneratingFor(student.id)
    const result = await draftReport({
      studentId: student.id,
      classroomId,
      term: term.trim(),
    })
    setGeneratingFor(null)

    if (result.error || !result.report) {
      toast.error(result.error ?? 'Could not generate draft')
      return
    }
    const withStudent: ReportWithStudent = {
      ...result.report,
      student: { id: student.id, full_name: student.full_name, photo_url: null },
    }
    setReports((prev) => [
      withStudent,
      ...prev.filter((r) => r.id !== withStudent.id),
    ])
    setEditing(withStudent)
    toast.success(`Kcolos drafted ${student.full_name.split(' ')[0]}'s report — review it before publishing`)
  }

  async function handleStatusChange(report: ReportWithStudent, publish: boolean) {
    const result = await setReportStatus(report.id, publish)
    if (result.error) {
      toast.error(result.error)
      return
    }
    setReports((prev) =>
      prev.map((r) =>
        r.id === report.id
          ? {
              ...r,
              status: publish ? 'published' : 'draft',
              published_at: publish ? new Date().toISOString() : null,
            }
          : r
      )
    )
    toast.success(publish ? 'Report published — parents can now see it' : 'Report unpublished')
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Term selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Label htmlFor="report-term" className="text-sm text-muted-foreground">
            Term
          </Label>
          <Input
            id="report-term"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="h-9 w-44"
            placeholder="Term 1 2026"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {reportByStudent.size}/{students.length} drafted ·{' '}
          {[...reportByStudent.values()].filter((r) => r.status === 'published').length}{' '}
          published
        </p>
      </div>

      {/* Student list */}
      <div className="bg-card rounded-2xl border border-border shadow-xs divide-y divide-border/60">
        {students.map((student) => {
          const report = reportByStudent.get(student.id)
          const generating = generatingFor === student.id
          return (
            <div key={student.id} className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                {getInitials(student.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{student.full_name}</p>
                {report ? (
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(report.updated_at).toLocaleDateString('en-GB')}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">No report for this term</p>
                )}
              </div>
              {report && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs capitalize',
                    report.status === 'published'
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  )}
                >
                  {report.status}
                </Badge>
              )}
              <div className="flex items-center gap-1.5">
                {report && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => setEditing(report)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Review
                  </Button>
                )}
                {report?.status === 'published' ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-muted-foreground"
                    onClick={() => handleStatusChange(report, false)}
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    Unpublish
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="h-8"
                    disabled={generating}
                    onClick={() =>
                      report ? handleStatusChange(report, true) : handleGenerate(student)
                    }
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Kcolos is studying…
                      </>
                    ) : report ? (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Publish
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        Generate
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
        {students.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No students in this classroom yet.
          </p>
        )}
      </div>

      {editing && (
        <ReportEditor
          report={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

// ─── Vetting editor ──────────────────────────────────────────

function ReportEditor({
  report,
  onClose,
  onSaved,
}: {
  report: ReportWithStudent
  onClose: () => void
  onSaved: (report: ReportWithStudent) => void
}) {
  const [saving, setSaving] = useState(false)
  const [summary, setSummary] = useState(report.summary ?? '')
  const [strengths, setStrengths] = useState<string[]>(parseStrengths(report))
  const [focusAreas, setFocusAreas] = useState<ReportFocusArea[]>(parseFocusAreas(report))
  const [teacherNote, setTeacherNote] = useState(report.teacher_note ?? '')

  function updateFocusArea(index: number, patch: Partial<ReportFocusArea>) {
    setFocusAreas((prev) => prev.map((fa, i) => (i === index ? { ...fa, ...patch } : fa)))
  }

  async function handleSave() {
    setSaving(true)
    const result = await updateReport(report.id, {
      summary,
      strengths: strengths.filter((s) => s.trim()),
      focus_areas: focusAreas,
      teacher_note: teacherNote,
    })
    setSaving(false)

    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Report saved')
    onSaved({
      ...report,
      summary,
      strengths: strengths.filter((s) => s.trim()),
      focus_areas: focusAreas as unknown as StudentReport['focus_areas'],
      teacher_note: teacherNote || null,
    })
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            {report.student?.full_name} — {report.term}
          </DialogTitle>
          <DialogDescription>
            Kcolos drafted this from scores and attendance. Edit anything — your version is
            what parents will read.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 -mx-1 px-1">
          <div className="space-y-5 pb-2">
            {/* Summary */}
            <div className="space-y-1.5">
              <Label htmlFor="re-summary">Performance summary</Label>
              <Textarea
                id="re-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="min-h-24"
              />
            </div>

            {/* Strengths */}
            <div className="space-y-1.5">
              <Label>Strengths</Label>
              <div className="space-y-2">
                {strengths.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={s}
                      onChange={(e) =>
                        setStrengths((prev) =>
                          prev.map((v, j) => (j === i ? e.target.value : v))
                        )
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        setStrengths((prev) => prev.filter((_, j) => j !== i))
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStrengths((prev) => [...prev, ''])}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add strength
                </Button>
              </div>
            </div>

            {/* Focus areas */}
            <div className="space-y-2">
              <Label>Focus areas & reinforcement</Label>
              {focusAreas.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No focus areas — Kcolos found nothing needing reinforcement.
                </p>
              )}
              {focusAreas.map((fa, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-muted/30 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      value={fa.area}
                      onChange={(e) => updateFocusArea(i, { area: e.target.value })}
                      className="h-8 font-semibold"
                      aria-label="Focus area name"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        setFocusAreas((prev) => prev.filter((_, j) => j !== i))
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Observation</p>
                    <Textarea
                      value={fa.observation}
                      onChange={(e) => updateFocusArea(i, { observation: e.target.value })}
                      className="min-h-16 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      In class (for you)
                    </p>
                    <Textarea
                      value={fa.suggestion}
                      onChange={(e) => updateFocusArea(i, { suggestion: e.target.value })}
                      className="min-h-16 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      At home (for parents)
                    </p>
                    <Textarea
                      value={fa.home_support}
                      onChange={(e) => updateFocusArea(i, { home_support: e.target.value })}
                      className="min-h-16 text-sm"
                    />
                  </div>
                  {fa.resources?.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">Resources</p>
                      {fa.resources.map((res, ri) => (
                        <div key={ri} className="flex items-center gap-2 text-sm">
                          {res.type === 'youtube' ? (
                            <Youtube className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
                          ) : res.type === 'reading' ? (
                            <BookOpen className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          ) : (
                            <PencilRuler className="h-3.5 w-3.5 text-warning flex-shrink-0" />
                          )}
                          <span className="flex-1 truncate">{res.title}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              updateFocusArea(i, {
                                resources: fa.resources.filter((_, rj) => rj !== ri),
                              })
                            }
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Teacher note */}
            <div className="space-y-1.5">
              <Label htmlFor="re-note">
                Personal note to parents{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="re-note"
                value={teacherNote}
                onChange={(e) => setTeacherNote(e.target.value)}
                placeholder="A short personal message from you…"
                className="min-h-16"
              />
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
