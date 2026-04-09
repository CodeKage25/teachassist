'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EnrollStudentDialog } from '@/components/teacher/EnrollStudentDialog'
import { UserPlus } from 'lucide-react'

interface TeacherEnrollStudentButtonProps {
  classrooms: { id: string; name: string }[]
}

export function TeacherEnrollStudentButton({ classrooms }: TeacherEnrollStudentButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        className="bg-blue-700 hover:bg-blue-800 text-white cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Enroll Student
      </Button>
      <EnrollStudentDialog open={open} onOpenChange={setOpen} classrooms={classrooms} />
    </>
  )
}
