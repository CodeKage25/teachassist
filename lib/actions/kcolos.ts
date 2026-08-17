'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { generatePassword } from '@/lib/utils'
import { sendParentWelcomeEmail } from '@/lib/email'
import {
  generateReinforcementReport,
  type KcolosReportDraft,
} from '@/lib/actions/ai'
import type {
  Assessment,
  AssessmentResult,
  AssessmentType,
  StudentReport,
} from '@/types/database'

async function getStaffContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('users')
    .select('school_id, role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'teacher'].includes(profile.role)) {
    throw new Error('Unauthorized')
  }
  if (!profile.school_id) throw new Error('No school linked')
  return { supabase, user, role: profile.role, schoolId: profile.school_id }
}

// ─── Assessments ─────────────────────────────────────────────

export async function createAssessment(input: {
  classroomId: string
  subject: string
  title: string
  type: AssessmentType
  term: string
  maxScore: number
  assessedOn?: string
}) {
  try {
    const { supabase, user, schoolId } = await getStaffContext()

    const { data, error } = await supabase
      .from('assessments')
      .insert({
        school_id: schoolId,
        classroom_id: input.classroomId,
        subject: input.subject.trim(),
        title: input.title.trim(),
        type: input.type,
        term: input.term.trim(),
        max_score: input.maxScore,
        assessed_on: input.assessedOn ?? undefined,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) return { error: error.message }
    revalidatePath('/teacher/gradebook')
    return { success: true, assessment: data as Assessment }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function deleteAssessment(assessmentId: string) {
  try {
    const { supabase } = await getStaffContext()
    const { error } = await supabase.from('assessments').delete().eq('id', assessmentId)
    if (error) return { error: error.message }
    revalidatePath('/teacher/gradebook')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function saveResults(
  assessmentId: string,
  entries: { studentId: string; score: number; remark?: string }[]
) {
  try {
    const { supabase } = await getStaffContext()

    const rows = entries.map((e) => ({
      assessment_id: assessmentId,
      student_id: e.studentId,
      score: e.score,
      remark: e.remark?.trim() || null,
    }))

    const { error } = await supabase
      .from('assessment_results')
      .upsert(rows, { onConflict: 'assessment_id,student_id' })

    if (error) return { error: error.message }
    revalidatePath('/teacher/gradebook')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ─── Kcolos reports ──────────────────────────────────────────

export async function draftReport(input: {
  studentId: string
  classroomId: string
  term: string
}) {
  try {
    const { supabase, user, schoolId } = await getStaffContext()

    const [{ data: student }, { data: classroom }] = await Promise.all([
      supabase.from('students').select('id, full_name').eq('id', input.studentId).single(),
      supabase.from('classrooms').select('id, name').eq('id', input.classroomId).single(),
    ])
    if (!student) return { error: 'Student not found' }

    // Gather this term's results for the student
    const { data: rawAssessments } = await supabase
      .from('assessments')
      .select('*')
      .eq('classroom_id', input.classroomId)
      .eq('term', input.term)
    const assessments = (rawAssessments as Assessment[] | null) ?? []

    let results: { assessment: Assessment; result: AssessmentResult }[] = []
    if (assessments.length > 0) {
      const { data: rawResults } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('student_id', input.studentId)
        .in('assessment_id', assessments.map((a) => a.id))
      const byId = new Map(assessments.map((a) => [a.id, a]))
      results = ((rawResults as AssessmentResult[] | null) ?? []).flatMap((r) => {
        const assessment = byId.get(r.assessment_id)
        return assessment ? [{ assessment, result: r }] : []
      })
    }

    const { data: attendanceRows } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', input.studentId)
    const att = ((attendanceRows as { status: string }[] | null) ?? [])
    const attendance = {
      present: att.filter((a) => a.status === 'present').length,
      absent: att.filter((a) => a.status === 'absent').length,
      late: att.filter((a) => a.status === 'late').length,
    }

    const { draft, error } = await generateReinforcementReport({
      studentName: student.full_name,
      classroomName: classroom?.name ?? 'Class',
      term: input.term,
      results: results.map(({ assessment, result }) => ({
        subject: assessment.subject,
        title: assessment.title,
        type: assessment.type,
        score: result.score,
        maxScore: assessment.max_score,
      })),
      attendance,
    })
    if (error || !draft) return { error: error ?? 'Draft generation failed' }

    const { data: report, error: upsertError } = await supabase
      .from('student_reports')
      .upsert(
        {
          school_id: schoolId,
          student_id: input.studentId,
          classroom_id: input.classroomId,
          teacher_id: user.id,
          term: input.term,
          status: 'draft',
          summary: draft.summary,
          strengths: draft.strengths,
          focus_areas: draft.focus_areas,
          published_at: null,
        },
        { onConflict: 'student_id,term' }
      )
      .select()
      .single()

    if (upsertError) return { error: upsertError.message }
    revalidatePath('/teacher/reports')
    return { success: true, report: report as StudentReport }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function updateReport(
  reportId: string,
  data: Pick<KcolosReportDraft, 'summary' | 'strengths' | 'focus_areas'> & {
    teacher_note?: string
  }
) {
  try {
    const { supabase } = await getStaffContext()
    const { error } = await supabase
      .from('student_reports')
      .update({
        summary: data.summary,
        strengths: data.strengths,
        focus_areas: data.focus_areas,
        teacher_note: data.teacher_note?.trim() || null,
      })
      .eq('id', reportId)

    if (error) return { error: error.message }
    revalidatePath('/teacher/reports')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function setReportStatus(reportId: string, publish: boolean) {
  try {
    const { supabase } = await getStaffContext()
    const { error } = await supabase
      .from('student_reports')
      .update({
        status: publish ? 'published' : 'draft',
        published_at: publish ? new Date().toISOString() : null,
      })
      .eq('id', reportId)

    if (error) return { error: error.message }
    revalidatePath('/teacher/reports')
    revalidatePath('/parent')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ─── Parent invitations (admin) ──────────────────────────────

export async function inviteParent(input: {
  email: string
  fullName: string
  studentId: string
  relationship?: string
}) {
  try {
    const { supabase, role, schoolId } = await getStaffContext()
    if (role !== 'admin') return { error: 'Only administrators can invite parents' }

    const adminClient = createAdminClient()
    const email = input.email.trim().toLowerCase()
    const password = generatePassword(12)

    // Create the parent account — or reuse it if this email already exists
    // (e.g. a parent with a second child at the school).
    let parentId: string | null = null
    let isNewAccount = false

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName,
        role: 'parent',
        school_id: schoolId,
      },
    })

    if (!createError && created.user) {
      parentId = created.user.id
      isNewAccount = true
    } else {
      const { data: list, error: listError } = await adminClient.auth.admin.listUsers({
        perPage: 1000,
      })
      if (listError) return { error: listError.message }
      const existing = list.users.find((u) => u.email === email)
      if (!existing) return { error: createError?.message ?? 'Could not create parent account' }
      parentId = existing.id
    }

    // Link guardian ↔ student (service client: action already verified admin)
    const { error: linkError } = await adminClient
      .from('student_guardians')
      .upsert(
        {
          parent_id: parentId,
          student_id: input.studentId,
          relationship: input.relationship?.trim() || null,
        },
        { onConflict: 'parent_id,student_id' }
      )
    if (linkError) return { error: linkError.message }

    if (isNewAccount) {
      const [{ data: school }, { data: student }] = await Promise.all([
        supabase.from('schools').select('name').eq('id', schoolId).single(),
        supabase.from('students').select('full_name').eq('id', input.studentId).single(),
      ])
      await sendParentWelcomeEmail({
        to: email,
        parentName: input.fullName,
        studentName: student?.full_name ?? 'your child',
        schoolName: school?.name ?? 'Your School',
        email,
        password,
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/login`,
      })
    }

    revalidatePath(`/admin/students/${input.studentId}`)
    return { success: true, isNewAccount, email, password: isNewAccount ? password : undefined }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
