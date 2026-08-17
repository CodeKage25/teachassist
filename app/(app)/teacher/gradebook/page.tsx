import { createClient } from '@/lib/supabase/server'
import { getTeacherClassrooms } from '@/lib/queries/classrooms'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList, Users, ArrowRight, School } from 'lucide-react'

export const metadata = { title: 'Gradebook' }

export default async function GradebookIndexPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const classrooms = await getTeacherClassrooms(user.id)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gradebook"
        description="Record CA tests, quizzes and exam scores — Kcolos studies these to draft each student's reinforcement report."
      />

      {classrooms.length === 0 ? (
        <EmptyState
          icon={School}
          title="No classrooms assigned"
          description="Once your administrator assigns you a classroom, you can start recording assessments here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {classrooms.map((room) => {
            const studentCount = room.students[0]?.count ?? 0
            return (
              <Link
                key={room.id}
                href={`/teacher/gradebook/${room.id}`}
                className="group bg-card rounded-2xl border border-border p-6 shadow-xs hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:scale-110">
                    <ClipboardList className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-bold text-lg mb-1">{room.name}</h3>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span className="text-sm">
                    {studentCount} student{studentCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
