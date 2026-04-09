import { createClient } from '@/lib/supabase/server'
import { getTeacherClassrooms } from '@/lib/queries/classrooms'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, User, Phone, School } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TeacherEnrollStudentButton } from '@/components/teacher/TeacherEnrollStudentButton'

export default async function TeacherStudentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const classrooms = await getTeacherClassrooms(user.id)

  if (classrooms.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Students"
          description="All students enrolled in your classrooms"
        />
        <EmptyState
          icon={GraduationCap}
          title="No classrooms assigned"
          description="You haven't been assigned to any classroom yet. Contact your administrator."
        />
      </div>
    )
  }

  const classroomIds = classrooms.map((c) => c.id)

  const { data: students } = await supabase
    .from('students')
    .select('*, classroom:classrooms(id, name)')
    .in('classroom_id', classroomIds)
    .order('full_name', { ascending: true })

  const allStudents = students ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Students"
        description={`${allStudents.length} student${allStudents.length !== 1 ? 's' : ''} across ${classrooms.length} classroom${classrooms.length !== 1 ? 's' : ''}`}
        action={<TeacherEnrollStudentButton classrooms={classrooms.map((c) => ({ id: c.id, name: c.name }))} />}
      />

      {allStudents.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No students yet"
          description="Enroll students into your classrooms using the button above."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allStudents.map((student: any) => (
            <div
              key={student.id}
              className="bg-white rounded-2xl border border-border p-5 space-y-3"
            >
              <div className="flex items-start gap-3">
                {student.photo_url ? (
                  <img
                    src={student.photo_url}
                    alt={student.full_name}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-5 w-5 text-blue-700" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{student.full_name}</p>
                  {student.age && (
                    <p className="text-xs text-slate-500 mt-0.5">Age {student.age}</p>
                  )}
                  {student.classroom && (
                    <Link href={`/teacher/classrooms/${student.classroom.id}`}>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-0 text-xs mt-1 cursor-pointer">
                        <School className="h-3 w-3 mr-1" />
                        {student.classroom.name}
                      </Badge>
                    </Link>
                  )}
                </div>
              </div>

              {(student.parent_name || student.parent_phone) && (
                <div className="border-t border-slate-100 pt-3 space-y-1.5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Parent</p>
                  {student.parent_name && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-700">
                      <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      {student.parent_name}
                    </div>
                  )}
                  {student.parent_phone && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-700">
                      <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <a href={`tel:${student.parent_phone}`} className="hover:text-blue-700 transition-colors">
                        {student.parent_phone}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {student.bio && (
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 border-t border-slate-100 pt-3">
                  {student.bio}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
