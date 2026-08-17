import { createClient } from '@/lib/supabase/server'
import { getClassroomAssessments } from '@/lib/queries/kcolos'
import { PageHeader } from '@/components/shared/PageHeader'
import { GradebookClient } from '@/components/kcolos/GradebookClient'
import { redirect, notFound } from 'next/navigation'
import type { Student } from '@/types/database'

export const metadata = { title: 'Gradebook' }

export default async function ClassroomGradebookPage({
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

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name')
    .eq('id', id)
    .single()
  if (!classroom) notFound()

  const [{ data: rawStudents }, assessments] = await Promise.all([
    supabase
      .from('students')
      .select('id, full_name')
      .eq('classroom_id', id)
      .order('full_name'),
    getClassroomAssessments(id),
  ])

  const students = (rawStudents as Pick<Student, 'id' | 'full_name'>[] | null) ?? []

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${classroom.name} — Gradebook`}
        description="Create assessments and record scores. Every score you enter sharpens Kcolos's picture of each student."
      />
      <GradebookClient
        classroomId={classroom.id}
        students={students}
        initialAssessments={assessments}
      />
    </div>
  )
}
