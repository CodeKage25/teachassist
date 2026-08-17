import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, User, BookOpen, Users } from 'lucide-react'
import { StudentPhotoUpload } from '@/components/students/StudentPhotoUpload'
import { InviteParentDialog } from '@/components/kcolos/InviteParentDialog'
import { getGuardiansOfStudent } from '@/lib/queries/kcolos'
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
  const guardians = await getGuardiansOfStudent(id)

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

      <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
        {/* Header: photo + name */}
        <div className="flex items-start gap-5">
          <StudentPhotoUpload
            studentId={id}
            currentPhotoUrl={student.photo_url}
            studentName={student.full_name}
          />
          <div>
            <h1 className="text-xl font-bold text-foreground">{student.full_name}</h1>
            {student.age && (
              <p className="text-sm text-muted-foreground mt-0.5">Age {student.age}</p>
            )}
            {classroom && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {classroom.name}
              </span>
            )}
          </div>
        </div>

        {/* Parent info */}
        {(student.parent_name || student.parent_phone) && (
          <div className="border-t border-border/60 pt-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Parent / Guardian
            </p>
            <div className="space-y-2">
              {student.parent_name && (
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  {student.parent_name}
                </div>
              )}
              {student.parent_phone && (
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <a href={`tel:${student.parent_phone}`} className="hover:text-primary transition-colors">
                    {student.parent_phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Kcolos: linked parent accounts */}
        <div className="border-t border-border/60 pt-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Parent accounts
            </p>
            <InviteParentDialog studentId={id} studentName={student.full_name} />
          </div>
          {guardians.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No parent account linked yet. Invite one so they can follow published reports.
            </p>
          ) : (
            <div className="space-y-2">
              {guardians.map((g) => (
                <div key={g.id} className="flex items-center gap-2 text-sm text-foreground/80">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  {g.full_name}
                  {g.relationship && (
                    <span className="text-xs text-muted-foreground">({g.relationship})</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes / Bio */}
        {student.bio && (
          <div className="border-t border-border/60 pt-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Notes
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed">{student.bio}</p>
          </div>
        )}

        {/* Empty state when no extra info */}
        {!student.parent_name && !student.parent_phone && !student.bio && (
          <div className="border-t border-border/60 pt-5">
            <p className="text-sm text-muted-foreground italic">No additional details on file.</p>
          </div>
        )}
      </div>
    </div>
  )
}
