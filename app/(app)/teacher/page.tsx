import { createClient } from '@/lib/supabase/server'
import { getTeacherClassrooms } from '@/lib/queries/classrooms'
import { EmptyState } from '@/components/shared/EmptyState'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { School, Users, ArrowRight } from 'lucide-react'
import { LessonPlanGenerator } from '@/components/shared/LessonPlanGenerator'

export default async function TeacherOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users').select('full_name, school_id').eq('id', user.id).single()

  const classrooms = await getTeacherClassrooms(user.id)

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-chart-4 text-primary-foreground p-8 sm:p-10 shadow-lg shadow-primary/20">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-grid opacity-[0.06]" />
          <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-float-slow" />
          <div className="absolute inset-0 bg-noise opacity-[0.05]" />
        </div>
        <div className="relative flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-medium text-primary-foreground/70">
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-1.5">
              Hello, {profile?.full_name?.split(' ')[0] ?? 'Teacher'} 👋
            </h1>
            <p className="text-primary-foreground/80 mt-2 text-sm sm:text-base">
              Here are your assigned classrooms.
            </p>
          </div>
          <LessonPlanGenerator />
        </div>
      </section>

      {classrooms.length === 0 ? (
        <EmptyState
          icon={School}
          title="No classrooms assigned"
          description="Your school administrator hasn't assigned you to any classroom yet. Please check back later."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {classrooms.map((room) => {
            const studentCount = room.students[0]?.count ?? 0

            return (
              <Link
                key={room.id}
                href={`/teacher/classrooms/${room.id}`}
                className="group bg-card rounded-2xl border border-border p-6 shadow-xs hover:border-primary/30 hover:shadow-md hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:scale-110">
                    <School className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-bold text-lg mb-1">{room.name}</h3>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span className="text-sm">{studentCount} student{studentCount !== 1 ? 's' : ''}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
