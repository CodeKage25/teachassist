'use client'

import { useState } from 'react'
import { addStudentAsTeacher } from '@/lib/actions/students'
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
import { Loader2, GraduationCap } from 'lucide-react'

interface AddStudentAsTeacherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classroomId: string
}

export function AddStudentAsTeacherDialog({
  open,
  onOpenChange,
  classroomId,
}: AddStudentAsTeacherDialogProps) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    formData.set('classroom_id', classroomId)
    setLoading(true)
    const result = await addStudentAsTeacher(formData)
    setLoading(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Student added to classroom!')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-700" />
            Add Student
          </DialogTitle>
          <DialogDescription>
            Enroll a new student into this classroom.
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
            <Label htmlFor="age">
              Age <span className="text-slate-400 font-normal text-xs">(optional)</span>
            </Label>
            <Input
              id="age"
              name="age"
              type="number"
              min={3}
              max={25}
              placeholder="e.g. 12"
              className="h-10"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-700 hover:bg-blue-800 text-white cursor-pointer"
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
