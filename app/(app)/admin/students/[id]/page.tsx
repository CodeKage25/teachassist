import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, User, BookOpen } from 'lucide-react'
import { StudentPhotoUpload } from '@/components/students/StudentPhotoUpload'

interface Props {
  params: Promise<{ id: string }>
}

export default async function StudentDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: student } = await supabase
    .from('students')
    .select('*, classrooms(name)')
    .eq('id', id)
    .single()

  if (!student) notFound()

  const classroom = (student as any).classrooms as { name: string } | null

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to students
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
        {/* Header: photo + name */}
        <div className="flex items-start gap-5">
          <StudentPhotoUpload
            studentId={id}
            currentPhotoUrl={student.photo_url}
            studentName={student.full_name}
          />
          <div>
            <h1 className="text-xl font-bold text-slate-900">{student.full_name}</h1>
            {student.age && (
              <p className="text-sm text-slate-500 mt-0.5">Age {student.age}</p>
            )}
            {classroom && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                {classroom.name}
              </span>
            )}
          </div>
        </div>

        {/* Parent info */}
        {(student.parent_name || student.parent_phone) && (
          <div className="border-t border-slate-100 pt-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Parent / Guardian
            </p>
            <div className="space-y-2">
              {student.parent_name && (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  {student.parent_name}
                </div>
              )}
              {student.parent_phone && (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <a href={`tel:${student.parent_phone}`} className="hover:text-blue-700 transition-colors">
                    {student.parent_phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes / Bio */}
        {student.bio && (
          <div className="border-t border-slate-100 pt-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Notes
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">{student.bio}</p>
          </div>
        )}

        {/* Empty state when no extra info */}
        {!student.parent_name && !student.parent_phone && !student.bio && (
          <div className="border-t border-slate-100 pt-5">
            <p className="text-sm text-slate-400 italic">No additional details on file.</p>
          </div>
        )}
      </div>
    </div>
  )
}
