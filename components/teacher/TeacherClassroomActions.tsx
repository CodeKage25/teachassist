'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AddStudentAsTeacherDialog } from '@/components/students/AddStudentAsTeacherDialog'
import { UserPlus } from 'lucide-react'

interface TeacherClassroomActionsProps {
  classroomId: string
}

export function TeacherClassroomActions({ classroomId }: TeacherClassroomActionsProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        className="border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Add Student
      </Button>
      <AddStudentAsTeacherDialog
        open={open}
        onOpenChange={setOpen}
        classroomId={classroomId}
      />
    </>
  )
}
