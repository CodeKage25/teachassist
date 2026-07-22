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
  const totalStudents = classrooms.reduce(
    (sum, room) => sum + (room.students[0]?.count ?? 0),
    0
  )

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
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mt-1.5">
              Hello, {profile?.full_name?.split(' ')[0] ?? 'Teacher'} 👋
            </h1>
            <p className="text-primary-foreground/80 mt-2 text-sm sm:text-base">
              Here are your assigned classrooms.
            </p>
            {/* At-a-glance chips */}
            <div className="flex flex-wrap gap-2.5 mt-6">
              {[
                { label: classrooms.length === 1 ? 'classroom' : 'classrooms', value: classrooms.length },
                { label: 'students', value: totalStudents },
              ].map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-baseline gap-1.5 rounded-full bg-white/12 backdrop-blur border border-white/20 px-3.5 py-1.5 text-sm"
                >
                  <span className="font-display font-semibold tabular">{chip.value}</span>
                  <span className="text-primary-foreground/70 text-xs">{chip.label}</span>
                </span>
              ))}
            </div>
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
                className="group relative bg-card rounded-2xl border border-border overflow-hidden shadow-xs hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Gradient header band */}
                <div className="relative h-20 bg-gradient-to-br from-primary to-chart-4 overflow-hidden">
                  <div aria-hidden className="absolute inset-0 bg-grid opacity-[0.1]" />
                  <div
                    aria-hidden
                    className="absolute -top-10 -right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-125"
                  />
                  <ArrowRight className="absolute top-4 right-4 h-4 w-4 text-primary-foreground/70 group-hover:text-primary-foreground group-hover:translate-x-1 transition-all" />
                </div>
                {/* Floating icon chip */}
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
