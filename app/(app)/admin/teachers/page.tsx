'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { TeacherTable } from '@/components/teachers/TeacherTable'
import { AddTeacherDialog } from '@/components/teachers/AddTeacherDialog'
import { Button } from '@/components/ui/button'
import { Users, UserPlus, Loader2 } from 'lucide-react'
import type { TeacherWithClassroom } from '@/types/database'

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherWithClassroom[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadTeachers = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('users')
      .select('school_id')
      .eq('id', user.id)
      .single()

    if (!profile?.school_id) {
      setTeachers([])
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('users')
      .select(`
        *,
        classroom:classrooms!classrooms_teacher_id_fkey(id, name)
      `)
      .eq('school_id', profile.school_id)
      .eq('role', 'teacher')
      .order('created_at', { ascending: false })

    setTeachers((data ?? []) as unknown as TeacherWithClassroom[])
    setLoading(false)
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void loadTeachers()
    })
  }, [loadTeachers])

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open)
    if (!open) void loadTeachers()
  }

  return (
    <div>
      <PageHeader
        title="Teachers"
        description="Manage your school's teaching staff"
        action={
          <Button
            className="bg-blue-700 hover:bg-blue-800 text-white cursor-pointer"
            onClick={() => setDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
        </div>
      ) : teachers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teachers yet"
          description="Add your first teacher. Their login credentials will be created instantly."
          action={
            <Button
              className="bg-blue-700 hover:bg-blue-800 text-white cursor-pointer"
              onClick={() => setDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add First Teacher
            </Button>
          }
        />
      ) : (
        <TeacherTable teachers={teachers} />
      )}

      <AddTeacherDialog open={dialogOpen} onOpenChange={handleDialogOpenChange} />
    </div>
  )
}
