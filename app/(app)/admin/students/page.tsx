'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { AddStudentDialog } from '@/components/students/AddStudentDialog'
import { deleteStudent, updateStudent } from '@/lib/actions/students'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { GraduationCap, UserPlus, MoreHorizontal, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [classrooms, setClassrooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('users').select('school_id').eq('id', user.id).single()
    if (!profile?.school_id) return

    const [studentsRes, classroomsRes] = await Promise.all([
      supabase
        .from('students')
        .select(`*, classroom:classrooms(id, name)`)
        .eq('school_id', profile.school_id)
        .order('full_name', { ascending: true }),
      supabase
        .from('classrooms')
        .select('id, name')
        .eq('school_id', profile.school_id)
        .order('name'),
    ])

    setStudents(studentsRes.data ?? [])
    setClassrooms(classroomsRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])
  useEffect(() => { if (!dialogOpen) loadData() }, [dialogOpen])

  async function handleDelete() {
    if (!selected) return
    setDeleting(true)
    const result = await deleteStudent(selected.id)
    setDeleting(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Student removed')
      setConfirmOpen(false)
      loadData()
    }
  }

  return (
    <div>
      <PageHeader
        title="Students"
        description="Manage all enrolled students"
        action={
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No students yet"
          description="Add your first student and assign them to a classroom."
          action={
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add First Student
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Classroom</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Added</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-sm">{student.full_name}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {student.classroom ? (
                      <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-0">
                        {student.classroom.name}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                    {formatDate(student.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => { setSelected(student); setConfirmOpen(true) }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddStudentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        classrooms={classrooms}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remove Student"
        description={`Remove ${selected?.full_name} from the school?`}
        confirmLabel="Remove"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
