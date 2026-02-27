'use client'

import { useState } from 'react'
import { addStudent } from '@/lib/actions/students'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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
import { Loader2, GraduationCap } from 'lucide-react'

interface AddStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classrooms: { id: string; name: string }[]
}

export function AddStudentDialog({
  open,
  onOpenChange,
  classrooms,
}: AddStudentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [classroomId, setClassroomId] = useState<string>('none')

  async function handleSubmit(formData: FormData) {
    if (classroomId !== 'none') formData.set('classroom_id', classroomId)
    setLoading(true)
    const result = await addStudent(formData)
    setLoading(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Student added!')
      setClassroomId('none')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            Add Student
          </DialogTitle>
          <DialogDescription>
            Add a new student and optionally assign them to a classroom.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              name="full_name"
              placeholder="John Doe"
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label>Classroom (optional)</Label>
            <Select value={classroomId} onValueChange={setClassroomId}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select a classroom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No classroom</SelectItem>
                {classrooms.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
