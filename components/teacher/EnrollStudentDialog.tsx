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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, GraduationCap } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EnrollStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classrooms: { id: string; name: string }[]
  defaultClassroomId?: string
}

export function EnrollStudentDialog({
  open,
  onOpenChange,
  classrooms,
  defaultClassroomId,
}: EnrollStudentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [classroomId, setClassroomId] = useState<string>(defaultClassroomId ?? classrooms[0]?.id ?? '')
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    if (!classroomId) {
      toast.error('Please select a classroom')
      return
    }
    formData.set('classroom_id', classroomId)
    setLoading(true)
    const result = await addStudentAsTeacher(formData)
    setLoading(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Student enrolled!')
      onOpenChange(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-700" />
            Enroll Student
          </DialogTitle>
          <DialogDescription>
            Add a new student and enroll them in one of your classrooms.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name *</Label>
            <Input
              id="full_name"
              name="full_name"
              placeholder="John Doe"
              required
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="age">Age <span className="text-slate-400 font-normal text-xs">(optional)</span></Label>
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
            <div className="space-y-2">
              <Label>Classroom *</Label>
              <Select value={classroomId} onValueChange={setClassroomId}>
                <SelectTrigger className="h-10 cursor-pointer">
                  <SelectValue placeholder="Select classroom" />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Parent / Guardian</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="parent_name">Parent name <span className="text-slate-400 font-normal text-xs">(optional)</span></Label>
                <Input
                  id="parent_name"
                  name="parent_name"
                  placeholder="Jane Doe"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent_phone">Phone <span className="text-slate-400 font-normal text-xs">(optional)</span></Label>
                <Input
                  id="parent_phone"
                  name="parent_phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  className="h-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Notes <span className="text-slate-400 font-normal text-xs">(optional)</span></Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Any additional notes about the student..."
              className="resize-none h-16"
            />
          </div>

          <div className="flex gap-3 pt-2">
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enroll Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
