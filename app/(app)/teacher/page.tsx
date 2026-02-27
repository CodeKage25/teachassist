import { createClient } from '@/lib/supabase/server'
import { getTeacherClassrooms } from '@/lib/queries/classrooms'
import { PageHeader } from '@/components/shared/PageHeader'
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
      <div className="flex items-start justify-between flex-wrap gap-4">
        <PageHeader
          title={`Hello, ${profile?.full_name?.split(' ')[0] ?? 'Teacher'} 👋`}
          description="Here are your assigned classrooms"
        />
        <LessonPlanGenerator />
      </div>

      {classrooms.length === 0 ? (
        <EmptyState
          icon={School}
          title="No classrooms assigned"
          description="Your school administrator hasn't assigned you to any classroom yet. Please check back later."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map((room) => {
            const studentCount = Array.isArray((room as any).students)
              ? (room as any).students[0]?.count ?? 0
              : 0

            return (
              <Link
                key={room.id}
                href={`/teacher/classrooms/${room.id}`}
                className="group bg-white rounded-2xl border border-border p-6 hover:border-purple-200 hover:shadow-md hover:shadow-purple-50 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <School className="h-5 w-5 text-purple-600" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
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
