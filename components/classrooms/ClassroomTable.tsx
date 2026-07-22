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
import { MoreHorizontal, Trash2, Users, School } from 'lucide-react'
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
  studentCount?: number
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
      <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Classroom</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Teacher</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Students</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Created</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {classrooms.map((room) => (
              <TableRow key={room.id} className="group transition-colors duration-200 hover:bg-muted/40">
                <TableCell>
                  <Link
                    href={`/admin/classrooms/${room.id}`}
                    className="flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:bg-primary group-hover:scale-105">
                      <School className="h-4 w-4 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {room.name}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {room.teacher ? (
                    <Badge variant="secondary" className="bg-accent text-accent-foreground border-0 font-medium">
                      {room.teacher.full_name}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">No teacher</span>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="inline-flex items-center gap-1 text-sm text-foreground/80 tabular">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    {room.studentCount ?? 0}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground hidden md:table-cell tabular">
                  {formatDate(room.created_at)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/classrooms/${room.id}`} className="cursor-pointer">
                          <Users className="mr-2 h-4 w-4" />
                          View details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
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
