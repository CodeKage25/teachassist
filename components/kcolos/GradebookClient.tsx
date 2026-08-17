'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAssessment, deleteAssessment, saveResults } from '@/lib/actions/kcolos'
import type { AssessmentWithResults } from '@/lib/queries/kcolos'
import type { AssessmentType, Student } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import {
  ClipboardList,
  Plus,
  Loader2,
  Trash2,
  ChevronLeft,
  Save,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const TYPE_LABELS: Record<AssessmentType, string> = {
  ca: 'CA Test',
  exam: 'Exam',
  quiz: 'Quiz',
  assignment: 'Assignment',
}

interface GradebookClientProps {
  classroomId: string
  students: Pick<Student, 'id' | 'full_name'>[]
  initialAssessments: AssessmentWithResults[]
}

export function GradebookClient({
  classroomId,
  students,
  initialAssessments,
}: GradebookClientProps) {
  const router = useRouter()
  const [assessments, setAssessments] = useState(initialAssessments)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const selected = assessments.find((a) => a.id === selectedId) ?? null

  function handleCreated(assessment: AssessmentWithResults) {
    setAssessments((prev) => [assessment, ...prev])
    setSelectedId(assessment.id)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const result = await deleteAssessment(deleteTarget)
    if (result.error) {
      toast.error(result.error)
    } else {
      setAssessments((prev) => prev.filter((a) => a.id !== deleteTarget))
      if (selectedId === deleteTarget) setSelectedId(null)
      toast.success('Assessment deleted')
      router.refresh()
    }
    setDeleteTarget(null)
  }

  if (selected) {
    return (
      <ResultsEntry
        key={selected.id}
        assessment={selected}
        students={students}
        onBack={() => {
          setSelectedId(null)
          router.refresh()
        }}
        onSaved={(results) => {
          setAssessments((prev) =>
            prev.map((a) => (a.id === selected.id ? { ...a, results } : a))
          )
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New assessment
        </Button>
      </div>

      {assessments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assessments yet"
          description="Create your first CA test, quiz or exam to start recording scores for this classroom."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Create assessment
            </Button>
          }
        />
      ) : (
        <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Assessment</TableHead>
                <TableHead className="font-semibold">Subject</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Term</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Date</TableHead>
                <TableHead className="font-semibold text-right">Scores</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map((a) => (
                <TableRow
                  key={a.id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => setSelectedId(a.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Badge variant="secondary" className="text-xs">
                        {TYPE_LABELS[a.type]}
                      </Badge>
                      <span className="font-medium">{a.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.subject}</TableCell>
                  <TableCell className="text-muted-foreground hidden sm:table-cell">
                    {a.term}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">
                    {a.assessed_on}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        'text-sm tabular',
                        a.results.length === students.length && students.length > 0
                          ? 'text-success'
                          : 'text-muted-foreground'
                      )}
                    >
                      {a.results.length}/{students.length}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteTarget(a.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateAssessmentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        classroomId={classroomId}
        onCreated={handleCreated}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete assessment?"
        description="This removes the assessment and all recorded scores. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  )
}

// ─── Create dialog ───────────────────────────────────────────

function CreateAssessmentDialog({
  open,
  onOpenChange,
  classroomId,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  classroomId: string
  onCreated: (assessment: AssessmentWithResults) => void
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    subject: '',
    title: '',
    type: 'ca' as AssessmentType,
    term: '',
    maxScore: '100',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.subject.trim() || !form.title.trim() || !form.term.trim()) {
      toast.warning('Subject, title and term are required')
      return
    }
    const maxScore = Number(form.maxScore)
    if (!Number.isFinite(maxScore) || maxScore <= 0) {
      toast.warning('Max score must be a positive number')
      return
    }

    setSaving(true)
    const result = await createAssessment({
      classroomId,
      subject: form.subject,
      title: form.title,
      type: form.type,
      term: form.term,
      maxScore,
    })
    setSaving(false)

    if (result.error || !result.assessment) {
      toast.error(result.error ?? 'Could not create assessment')
      return
    }
    toast.success('Assessment created — now enter scores')
    onCreated({ ...result.assessment, results: [] })
    onOpenChange(false)
    setForm({ subject: '', title: '', type: 'ca', term: form.term, maxScore: '100' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New assessment</DialogTitle>
          <DialogDescription>
            Define the assessment — you&apos;ll enter each student&apos;s score next.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ga-subject">Subject *</Label>
              <Input
                id="ga-subject"
                placeholder="Mathematics"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ga-type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v as AssessmentType }))}
              >
                <SelectTrigger id="ga-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TYPE_LABELS) as AssessmentType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ga-title">Title *</Label>
            <Input
              id="ga-title"
              placeholder="First CA Test — Fractions"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ga-term">Term *</Label>
              <Input
                id="ga-term"
                placeholder="Term 1 2026"
                value={form.term}
                onChange={(e) => setForm((f) => ({ ...f, term: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ga-max">Max score</Label>
              <Input
                id="ga-max"
                type="number"
                min="1"
                value={form.maxScore}
                onChange={(e) => setForm((f) => ({ ...f, maxScore: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Results entry ───────────────────────────────────────────

function ResultsEntry({
  assessment,
  students,
  onBack,
  onSaved,
}: {
  assessment: AssessmentWithResults
  students: Pick<Student, 'id' | 'full_name'>[]
  onBack: () => void
  onSaved: (results: AssessmentWithResults['results']) => void
}) {
  const [saving, setSaving] = useState(false)
  const [scores, setScores] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const r of assessment.results) initial[r.student_id] = String(r.score)
    return initial
  })

  async function handleSave() {
    const entries: { studentId: string; score: number }[] = []
    for (const student of students) {
      const raw = scores[student.id]
      if (raw === undefined || raw.trim() === '') continue
      const score = Number(raw)
      if (!Number.isFinite(score) || score < 0 || score > assessment.max_score) {
        toast.warning(
          `${student.full_name}: score must be between 0 and ${assessment.max_score}`
        )
        return
      }
      entries.push({ studentId: student.id, score })
    }
    if (entries.length === 0) {
      toast.warning('Enter at least one score')
      return
    }

    setSaving(true)
    const result = await saveResults(assessment.id, entries)
    setSaving(false)

    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(`Saved ${entries.length} score${entries.length !== 1 ? 's' : ''}`)
    onSaved(
      entries.map((e) => ({
        id: `${assessment.id}-${e.studentId}`,
        assessment_id: assessment.id,
        student_id: e.studentId,
        score: e.score,
        remark: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          All assessments
        </button>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{TYPE_LABELS[assessment.type]}</Badge>
          <span className="text-sm font-semibold">{assessment.title}</span>
          <span className="text-sm text-muted-foreground">/ {assessment.max_score}</span>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold">Student</TableHead>
              <TableHead className="font-semibold w-40 text-right">
                Score (max {assessment.max_score})
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">{student.full_name}</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    min="0"
                    max={assessment.max_score}
                    inputMode="decimal"
                    aria-label={`Score for ${student.full_name}`}
                    className="h-9 w-28 ml-auto text-right tabular"
                    value={scores[student.id] ?? ''}
                    onChange={(e) =>
                      setScores((prev) => ({ ...prev, [student.id]: e.target.value }))
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save scores
        </Button>
      </div>
    </div>
  )
}
