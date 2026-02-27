'use server'

import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import type { AttendanceStatus } from '@/types/database'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// ─────────────────────────────────────────────────────────────
// Attendance Insights
// ─────────────────────────────────────────────────────────────

interface AttendanceRecord {
  student_name: string
  date: string
  status: AttendanceStatus
}

export async function getAttendanceInsights(
  schoolId: string,
  classroomName?: string
): Promise<{ insight: string; error?: string }> {
  const supabase = await createClient()

  // Fetch attendance data for the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  let attendanceQuery = supabase
    .from('attendance')
    .select(`
      date,
      status,
      student_id
    `)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])

  if (classroomName) {
    // Get classroom ID first if filtering by classroom
    const { data: classroom } = await supabase
      .from('classrooms')
      .select('id')
      .eq('school_id', schoolId)
      .eq('name', classroomName)
      .single()

    if (classroom) {
      attendanceQuery = attendanceQuery.eq('classroom_id', classroom.id)
    }
  }

  const { data: rawAttendance } = await attendanceQuery
  const attendance = rawAttendance as { date: string; status: AttendanceStatus; student_id: string }[] | null

  if (!attendance || attendance.length === 0) {
    return { insight: 'No attendance data available for the last 30 days.' }
  }

  // Fetch student names
  const studentIds = [...new Set(attendance.map((a) => a.student_id))]
  const { data: rawStudents } = await supabase
    .from('students')
    .select('id, full_name')
    .in('id', studentIds)
  const students = rawStudents as { id: string; full_name: string }[] | null
  const studentMap: Record<string, string> = {}
  students?.forEach((s) => { studentMap[s.id] = s.full_name })

  // Build summary stats
  const totalRecords = attendance.length
  const presentCount = attendance.filter((a) => a.status === 'present').length
  const absentCount = attendance.filter((a) => a.status === 'absent').length
  const lateCount = attendance.filter((a) => a.status === 'late').length
  const attendanceRate = Math.round((presentCount / totalRecords) * 100)

  // Find students with high absence rates
  const studentAbsences: Record<string, { absent: number; total: number; name: string }> = {}
  attendance.forEach((a) => {
    const name = studentMap[a.student_id] ?? 'Unknown'
    if (!studentAbsences[a.student_id]) {
      studentAbsences[a.student_id] = { absent: 0, total: 0, name }
    }
    studentAbsences[a.student_id].total++
    if (a.status === 'absent') studentAbsences[a.student_id].absent++
  })

  const atRiskStudents = Object.values(studentAbsences)
    .filter((s) => s.total > 0 && s.absent / s.total > 0.3)
    .sort((a, b) => b.absent / b.total - a.absent / a.total)
    .slice(0, 5)

  const prompt = `You are an intelligent school management assistant. Analyze the following attendance data and provide a concise, actionable insight report for a school administrator.

ATTENDANCE DATA (Last 30 days):
- Total attendance records: ${totalRecords}
- Present: ${presentCount} (${attendanceRate}%)
- Absent: ${absentCount}
- Late: ${lateCount}
${classroomName ? `- Classroom: ${classroomName}` : '- Scope: Entire school'}

AT-RISK STUDENTS (>30% absence rate):
${atRiskStudents.length > 0
  ? atRiskStudents.map((s) => `- ${s.name}: absent ${s.absent}/${s.total} days (${Math.round((s.absent / s.total) * 100)}%)`).join('\n')
  : '- None identified'
}

Write a brief, professional insight (3-5 sentences) that:
1. Summarizes overall attendance health
2. Highlights any concerning patterns
3. Suggests 1-2 specific, actionable steps for improvement
Use plain text. Be direct and specific. Do not use markdown headers.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    })

    const insight = response.choices[0]?.message?.content ?? 'Unable to generate insights.'
    return { insight }
  } catch (err) {
    return {
      insight: '',
      error: err instanceof Error ? err.message : 'AI service unavailable',
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Lesson Plan Generator
// ─────────────────────────────────────────────────────────────

interface LessonPlanInput {
  subject: string
  topic: string
  gradeLevel: string
  duration: string
  objectives?: string
}

export async function generateLessonPlan(
  input: LessonPlanInput
): Promise<{ plan: string; error?: string }> {
  const prompt = `You are an expert curriculum designer and educator. Create a detailed, practical lesson plan based on the following:

Subject: ${input.subject}
Topic: ${input.topic}
Grade Level: ${input.gradeLevel}
Duration: ${input.duration}
${input.objectives ? `Learning Objectives: ${input.objectives}` : ''}

Generate a complete lesson plan with these sections:
1. **Learning Objectives** (3-4 clear, measurable goals)
2. **Materials Needed** (brief list)
3. **Introduction / Hook** (5 minutes - how to engage students)
4. **Main Activity** (step-by-step instructions for the bulk of the lesson)
5. **Assessment** (how to check understanding)
6. **Wrap-Up** (2-3 minute closing activity)
7. **Homework / Extension** (optional follow-up task)

Keep it practical, engaging, and appropriate for the grade level. Use clear language teachers can follow directly.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1200,
      temperature: 0.75,
    })

    const plan = response.choices[0]?.message?.content ?? 'Unable to generate lesson plan.'
    return { plan }
  } catch (err) {
    return {
      plan: '',
      error: err instanceof Error ? err.message : 'AI service unavailable',
    }
  }
}
