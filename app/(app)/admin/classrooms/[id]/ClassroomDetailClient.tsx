'use client'

import { useState } from 'react'
import { updateClassroom } from '@/lib/actions/classrooms'
import { addStudent } from '@/lib/actions/students'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UserPlus, Users, GraduationCap, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Props {
  classroom: { id: string; name: string; teacher_id: string | null }
  students: { id: string; full_name: string; created_at: string }[]
  teachers: { id: string; full_name: string }[]
}

export function ClassroomDetailClient({ classroom, students, teachers }: Props) {
  const [selectedTeacher, setSelectedTeacher] = useState(classroom.teacher_id ?? 'none')
  const [savingTeacher, setSavingTeacher] = useState(false)
  const [addStudentOpen, setAddStudentOpen] = useState(false)
  const [addingStudent, setAddingStudent] = useState(false)

  async function handleAssignTeacher() {
    setSavingTeacher(true)
    const result = await updateClassroom(classroom.id, {
      teacher_id: selectedTeacher === 'none' ? null : selectedTeacher,
    })
    setSavingTeacher(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Teacher assigned!')
    }
  }

  async function handleAddStudent(formData: FormData) {
    formData.append('classroom_id', classroom.id)
    setAddingStudent(true)
    const result = await addStudent(formData)
    setAddingStudent(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Student added!')
      setAddStudentOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Assign Teacher */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-600" />
          Assign Teacher
        </h2>
        <div className="flex gap-3 flex-wrap">
          <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
            <SelectTrigger className="w-64 h-10">
              <SelectValue placeholder="Select a teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No teacher</SelectItem>
              {teachers.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAssignTeacher}
            disabled={savingTeacher}
            className="bg-indigo-600 hover:bg-indigo-700 h-10"
          >
            {savingTeacher ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </Button>
        </div>
      </div>

      {/* Students */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-purple-600" />
            Students ({students.length})
          </h2>
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setAddStudentOpen(true)}
          >
            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
            Add Student
          </Button>
        </div>

        {students.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground text-sm">
            No students enrolled yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Enrolled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-sm">{s.full_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                    {formatDate(s.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add Student Dialog */}
      <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Student to {classroom.name}</DialogTitle>
          </DialogHeader>
          <form action={handleAddStudent} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Student name</Label>
              <Input
                id="full_name"
                name="full_name"
                placeholder="John Doe"
                required
                className="h-10"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setAddStudentOpen(false)}
                disabled={addingStudent}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                disabled={addingStudent}
              >
                {addingStudent ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Student'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
