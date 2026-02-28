'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ClassroomTable } from '@/components/classrooms/ClassroomTable'
import { CreateClassroomDialog } from '@/components/classrooms/CreateClassroomDialog'
import { Button } from '@/components/ui/button'
import { School, Plus, Loader2 } from 'lucide-react'

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  async function loadClassrooms() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('users')
      .select('school_id')
      .eq('id', user.id)
      .single()

    if (!profile?.school_id) return

    const { data } = await supabase
      .from('classrooms')
      .select(`
        *,
        teacher:users!classrooms_teacher_id_fkey(id, full_name),
        students(count)
      `)
      .eq('school_id', profile.school_id)
      .order('created_at', { ascending: false })

    const mapped = (data ?? []).map((c: any) => ({
      ...c,
      studentCount: c.students?.[0]?.count ?? 0,
    }))

    setClassrooms(mapped)
    setLoading(false)
  }

  useEffect(() => { loadClassrooms() }, [])
  useEffect(() => { if (!dialogOpen) loadClassrooms() }, [dialogOpen])

  return (
    <div>
      <PageHeader
        title="Classrooms"
        description="Create and manage your school's classrooms"
        action={
          <Button
            className="bg-blue-700 hover:bg-blue-800 text-white cursor-pointer"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Classroom
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
        </div>
      ) : classrooms.length === 0 ? (
        <EmptyState
          icon={School}
          title="No classrooms yet"
          description="Create your first classroom to get started. You can then assign teachers and students."
          action={
            <Button className="bg-blue-700 hover:bg-blue-800 text-white cursor-pointer" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Classroom
            </Button>
          }
        />
      ) : (
        <ClassroomTable classrooms={classrooms} />
      )}

      <CreateClassroomDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
