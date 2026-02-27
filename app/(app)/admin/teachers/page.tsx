'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { TeacherTable } from '@/components/teachers/TeacherTable'
import { AddTeacherDialog } from '@/components/teachers/AddTeacherDialog'
import { Button } from '@/components/ui/button'
import { Users, UserPlus } from 'lucide-react'

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  async function loadTeachers() {
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
      .from('users')
      .select(`
        *,
        classroom:classrooms!classrooms_teacher_id_fkey(id, name)
      `)
      .eq('school_id', profile.school_id)
      .eq('role', 'teacher')
      .order('created_at', { ascending: false })

    setTeachers(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadTeachers()
  }, [])

  // Reload after dialog closes
  useEffect(() => {
    if (!dialogOpen) loadTeachers()
  }, [dialogOpen])

  return (
    <div>
      <PageHeader
        title="Teachers"
        description="Manage your school's teaching staff"
        action={
          <Button
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Teacher
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : teachers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teachers yet"
          description="Invite your first teacher. They'll receive an email to set up their account."
          action={
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite First Teacher
            </Button>
          }
        />
      ) : (
        <TeacherTable teachers={teachers} />
      )}

      <AddTeacherDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
