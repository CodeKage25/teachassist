import { createClient } from '@/lib/supabase/server'
import type {
  Assessment,
  AssessmentResult,
  Student,
  StudentReport,
} from '@/types/database'

export type AssessmentWithResults = Assessment & { results: AssessmentResult[] }
export type ReportWithStudent = StudentReport & {
  student: Pick<Student, 'id' | 'full_name' | 'photo_url'> | null
}

// ─── Teacher: gradebook ──────────────────────────────────────

export async function getClassroomAssessments(
  classroomId: string
): Promise<AssessmentWithResults[]> {
  const supabase = await createClient()

  const { data: rawAssessments, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('assessed_on', { ascending: false })

  const assessments = rawAssessments as Assessment[] | null
  if (error || !assessments || assessments.length === 0) return []

  const { data: rawResults } = await supabase
    .from('assessment_results')
    .select('*')
    .in('assessment_id', assessments.map((a) => a.id))

  const results = (rawResults as AssessmentResult[] | null) ?? []
  return assessments.map((a) => ({
    ...a,
    results: results.filter((r) => r.assessment_id === a.id),
  }))
}

export async function getStudentResults(studentId: string): Promise<
  { assessment: Assessment; result: AssessmentResult }[]
> {
  const supabase = await createClient()

  const { data: rawResults } = await supabase
    .from('assessment_results')
    .select('*')
    .eq('student_id', studentId)

  const results = (rawResults as AssessmentResult[] | null) ?? []
  if (results.length === 0) return []

  const { data: rawAssessments } = await supabase
    .from('assessments')
    .select('*')
    .in('id', results.map((r) => r.assessment_id))

  const assessments = (rawAssessments as Assessment[] | null) ?? []
  const byId = new Map(assessments.map((a) => [a.id, a]))

  return results
    .flatMap((r) => {
      const assessment = byId.get(r.assessment_id)
      return assessment ? [{ assessment, result: r }] : []
    })
    .sort((a, b) => (a.assessment.assessed_on < b.assessment.assessed_on ? 1 : -1))
}

export async function getStudentAttendanceSummary(
  studentId: string
): Promise<{ present: number; absent: number; late: number }> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('attendance')
    .select('status')
    .eq('student_id', studentId)

  const rows = (data as { status: string }[] | null) ?? []
  return {
    present: rows.filter((r) => r.status === 'present').length,
    absent: rows.filter((r) => r.status === 'absent').length,
    late: rows.filter((r) => r.status === 'late').length,
  }
}

// ─── Reports ─────────────────────────────────────────────────

export async function getClassroomReports(
  classroomId: string
): Promise<ReportWithStudent[]> {
  const supabase = await createClient()

  const { data: rawReports } = await supabase
    .from('student_reports')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('updated_at', { ascending: false })

  return attachStudents((rawReports as StudentReport[] | null) ?? [])
}

export async function getReport(reportId: string): Promise<ReportWithStudent | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('student_reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (!data) return null
  const [report] = await attachStudents([data as StudentReport])
  return report ?? null
}

async function attachStudents(reports: StudentReport[]): Promise<ReportWithStudent[]> {
  if (reports.length === 0) return []
  const supabase = await createClient()

  const { data: rawStudents } = await supabase
    .from('students')
    .select('id, full_name, photo_url')
    .in('id', [...new Set(reports.map((r) => r.student_id))])

  const students = (rawStudents as Pick<Student, 'id' | 'full_name' | 'photo_url'>[] | null) ?? []
  const byId = new Map(students.map((s) => [s.id, s]))
  return reports.map((r) => ({ ...r, student: byId.get(r.student_id) ?? null }))
}

// ─── Parent portal ───────────────────────────────────────────

export type ChildWithClassroom = Student & {
  classroom: { id: string; name: string } | null
}

export async function getChildrenOfParent(parentId: string): Promise<ChildWithClassroom[]> {
  const supabase = await createClient()

  const { data: links } = await supabase
    .from('student_guardians')
    .select('student_id')
    .eq('parent_id', parentId)

  const studentIds = ((links as { student_id: string }[] | null) ?? []).map(
    (l) => l.student_id
  )
  if (studentIds.length === 0) return []

  const { data: rawStudents } = await supabase
    .from('students')
    .select('*')
    .in('id', studentIds)
    .order('full_name')

  const students = (rawStudents as Student[] | null) ?? []
  const classroomIds = [...new Set(students.map((s) => s.classroom_id).filter(Boolean))] as string[]
  const classroomMap = new Map<string, { id: string; name: string }>()

  if (classroomIds.length > 0) {
    const { data: cls } = await supabase
      .from('classrooms')
      .select('id, name')
      .in('id', classroomIds)
    ;((cls as { id: string; name: string }[] | null) ?? []).forEach((c) =>
      classroomMap.set(c.id, c)
    )
  }

  return students.map((s) => ({
    ...s,
    classroom: s.classroom_id ? (classroomMap.get(s.classroom_id) ?? null) : null,
  }))
}

export async function getPublishedReportsForChildren(
  studentIds: string[]
): Promise<ReportWithStudent[]> {
  if (studentIds.length === 0) return []
  const supabase = await createClient()

  const { data: rawReports } = await supabase
    .from('student_reports')
    .select('*')
    .in('student_id', studentIds)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return attachStudents((rawReports as StudentReport[] | null) ?? [])
}

// ─── Admin: guardians of a student ───────────────────────────

export async function getGuardiansOfStudent(
  studentId: string
): Promise<{ id: string; full_name: string; relationship: string | null }[]> {
  const supabase = await createClient()

  const { data: links } = await supabase
    .from('student_guardians')
    .select('parent_id, relationship')
    .eq('student_id', studentId)

  const typedLinks = (links as { parent_id: string; relationship: string | null }[] | null) ?? []
  if (typedLinks.length === 0) return []

  const { data: parents } = await supabase
    .from('users')
    .select('id, full_name')
    .in('id', typedLinks.map((l) => l.parent_id))

  const byId = new Map(
    ((parents as { id: string; full_name: string }[] | null) ?? []).map((p) => [p.id, p])
  )
  return typedLinks.flatMap((l) => {
    const parent = byId.get(l.parent_id)
    return parent
      ? [{ id: parent.id, full_name: parent.full_name, relationship: l.relationship }]
      : []
  })
}
