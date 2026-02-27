'use client'

import { useState } from 'react'
import { deleteClassroom } from '@/lib/actions/classrooms'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { MoreHorizontal, Trash2, Users } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

type ClassroomRow = {
  id: string
  name: string
  created_at: string
  teacher: { id: string; full_name: string } | null
  student_count?: number
}

interface ClassroomTableProps {
  classrooms: ClassroomRow[]
}

export function ClassroomTable({ classrooms }: ClassroomTableProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selected, setSelected] = useState<ClassroomRow | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!selected) return
    setLoading(true)
    const result = await deleteClassroom(selected.id)
    setLoading(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Classroom deleted')
      setConfirmOpen(false)
    }
  }

  if (classrooms.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No classrooms yet.
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="font-semibold">Classroom</TableHead>
              <TableHead className="font-semibold hidden sm:table-cell">Teacher</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">Created</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {classrooms.map((room) => (
              <TableRow key={room.id} className="hover:bg-slate-50/50">
                <TableCell>
                  <Link
                    href={`/admin/classrooms/${room.id}`}
                    className="font-medium text-sm hover:text-indigo-600 transition-colors"
                  >
                    {room.name}
                  </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {room.teacher ? (
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-0">
                      {room.teacher.full_name}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">No teacher</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                  {formatDate(room.created_at)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/classrooms/${room.id}`}>
                          <Users className="mr-2 h-4 w-4" />
                          View details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setSelected(room)
                          setConfirmOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Classroom"
        description={`Are you sure you want to delete "${selected?.name}"? Students will be unassigned.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  )
}
