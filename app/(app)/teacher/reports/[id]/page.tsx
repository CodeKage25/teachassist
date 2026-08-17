import { createClient } from '@/lib/supabase/server'
import { getClassroomReports } from '@/lib/queries/kcolos'
import { PageHeader } from '@/components/shared/PageHeader'
import { ReportsClient } from '@/components/kcolos/ReportsClient'
import { redirect, notFound } from 'next/navigation'
import type { Student } from '@/types/database'

export const metadata = { title: 'Kcolos Reports' }

export default async function ClassroomReportsPage({
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

  const [{ data: rawStudents }, reports] = await Promise.all([
    supabase
      .from('students')
      .select('id, full_name')
      .eq('classroom_id', id)
      .order('full_name'),
    getClassroomReports(id),
  ])

  const students = (rawStudents as Pick<Student, 'id' | 'full_name'>[] | null) ?? []

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${classroom.name} — Reports`}
        description="Generate, vet and publish each student's reinforcement report. Nothing reaches parents until you publish it."
      />
      <ReportsClient
        classroomId={classroom.id}
        students={students}
        initialReports={reports}
      />
    </div>
  )
}
