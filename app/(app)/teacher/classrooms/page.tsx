import { createClient } from '@/lib/supabase/server'
import { getTeacherClassrooms } from '@/lib/queries/classrooms'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, School, Users } from 'lucide-react'

export default async function TeacherClassroomsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const classrooms = await getTeacherClassrooms(user.id)

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Classrooms"
        description="All classrooms currently assigned to you"
      />

      {classrooms.length === 0 ? (
        <EmptyState
          icon={School}
          title="No classrooms assigned"
          description="Your school administrator hasn't assigned you to any classroom yet."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {classrooms.map((room) => {
            const studentCount = room.students[0]?.count ?? 0

            return (
              <Link
                key={room.id}
                href={`/teacher/classrooms/${room.id}`}
                className="group relative bg-card rounded-2xl border border-border overflow-hidden shadow-xs hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-20 bg-gradient-to-br from-primary to-chart-4 overflow-hidden">
                  <div aria-hidden className="absolute inset-0 bg-grid opacity-[0.1]" />
                  <div
                    aria-hidden
                    className="absolute -top-10 -right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-125"
                  />
                  <ArrowRight className="absolute top-4 right-4 h-4 w-4 text-primary-foreground/70 group-hover:text-primary-foreground group-hover:translate-x-1 transition-all" />
                </div>
                <div className="relative px-6">
                  <div className="absolute -top-6 w-12 h-12 bg-card border border-border rounded-2xl shadow-md flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                    <School className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="px-6 pt-9 pb-6">
                  <h3 className="font-display font-semibold text-xl mb-1.5">{room.name}</h3>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span className="text-sm">
                      {studentCount} student{studentCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
