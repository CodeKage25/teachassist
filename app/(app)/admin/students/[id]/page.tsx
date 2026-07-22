import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, User, BookOpen } from 'lucide-react'
import { StudentPhotoUpload } from '@/components/students/StudentPhotoUpload'
import type { Classroom, Student } from '@/types/database'

type StudentDetailRow = Student & {
  classrooms: Pick<Classroom, 'name'> | null
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function StudentDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('students')
    .select('*, classrooms(name)')
    .eq('id', id)
    .single()

  if (!data) notFound()

  const student = data as unknown as StudentDetailRow
  const classroom = student.classrooms

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to students
        </Link>
      </div>

      <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-xs animate-page-in">
        {/* Gradient banner */}
        <div className="relative h-28 bg-gradient-to-br from-primary to-chart-4 overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-grid opacity-[0.1]" />
          <div aria-hidden className="absolute -top-12 -right-8 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          <div aria-hidden className="absolute inset-0 bg-noise opacity-[0.05]" />
        </div>

        {/* Header: photo overlapping banner + name */}
        <div className="px-6 sm:px-8">
          <div className="flex items-end gap-5 -mt-10">
            <div className="rounded-2xl p-1 bg-card shadow-lg">
              <StudentPhotoUpload
                studentId={id}
                currentPhotoUrl={student.photo_url}
                studentName={student.full_name}
              />
            </div>
            <div className="pb-1 min-w-0">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-foreground truncate">
                {student.full_name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {student.age && (
                  <span className="text-xs font-medium bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
                    Age {student.age}
                  </span>
                )}
                {classroom ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-accent text-accent-foreground px-2.5 py-1 rounded-full">
                    {classroom.name}
                  </span>
                ) : (
                  <span className="text-xs font-medium bg-warning/15 text-warning-foreground px-2.5 py-1 rounded-full">
                    Unassigned
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detail tiles */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-muted/30 p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Parent / Guardian
            </p>
            {student.parent_name || student.parent_phone ? (
              <div className="space-y-2.5">
                {student.parent_name && (
                  <p className="text-sm font-medium text-foreground">{student.parent_name}</p>
                )}
                {student.parent_phone && (
                  <a
                    href={`tel:${student.parent_phone}`}
                    className="flex items-center gap-2 text-sm text-foreground/80 hover:text-primary transition-colors"
                  >
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {student.parent_phone}
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No guardian on file.</p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-muted/30 p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Notes
            </p>
            {student.bio ? (
              <p className="text-sm text-foreground/80 leading-relaxed">{student.bio}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No notes yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
