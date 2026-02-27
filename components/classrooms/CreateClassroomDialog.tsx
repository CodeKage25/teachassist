'use client'

import { useState } from 'react'
import { createClassroom } from '@/lib/actions/classrooms'
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
import { Loader2, School } from 'lucide-react'

interface CreateClassroomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateClassroomDialog({
  open,
  onOpenChange,
}: CreateClassroomDialogProps) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await createClassroom(formData)
    setLoading(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Classroom created!')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="h-5 w-5 text-indigo-600" />
            Create Classroom
          </DialogTitle>
          <DialogDescription>
            Enter a name for the new classroom.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Classroom name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Grade 5A, Biology 101"
              required
              className="h-10"
            />
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
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
