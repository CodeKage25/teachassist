import { createClient } from '@/lib/supabase/server'
import { getTeacherClassrooms } from '@/lib/queries/classrooms'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ClipboardCheck, School, Users, ArrowRight } from 'lucide-react'

export default async function TeacherAttendancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const classrooms = await getTeacherClassrooms(user.id)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Select a classroom to take or review attendance"
      />

      {classrooms.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No classrooms assigned"
          description="You haven't been assigned to any classroom yet. Contact your administrator."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map((room) => {
            const studentCount = Array.isArray(room.students)
              ? room.students[0]?.count ?? 0
              : 0

            return (
              <Link
                key={room.id}
                href={`/teacher/classrooms/${room.id}/attendance`}
                className="group bg-white rounded-2xl border border-border p-6 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                    <ClipboardCheck className="h-5 w-5 text-teal-700" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-700 group-hover:translate-x-1 transition-all" />
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
