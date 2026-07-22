'use client'

import { useState } from 'react'
import { toggleTeacherStatus } from '@/lib/actions/teachers'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { getInitials, formatDate } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MoreHorizontal, Power } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { UserProfile } from '@/types/database'

type TeacherWithClassroom = UserProfile & {
  classroom: { id: string; name: string } | null
}

interface TeacherTableProps {
  teachers: TeacherWithClassroom[]
}

export function TeacherTable({ teachers }: TeacherTableProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selected, setSelected] = useState<TeacherWithClassroom | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleToggleStatus() {
    if (!selected) return
    setLoading(true)
    const result = await toggleTeacherStatus(selected.id, !selected.is_active)
    setLoading(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(`Teacher ${selected.is_active ? 'deactivated' : 'activated'}`)
      setConfirmOpen(false)
    }
  }

  if (teachers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No teachers yet. Invite your first teacher!
      </div>
    )
  }

  return (
    <>
      <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Teacher</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Classroom</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Joined</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher.id} className="group transition-colors duration-200 hover:bg-muted/40">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 transition-transform duration-200 group-hover:scale-105">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-chart-4 text-primary-foreground text-xs font-bold">
                        {getInitials(teacher.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{teacher.full_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{teacher.role}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {teacher.classroom ? (
                    <Badge variant="secondary" className="bg-accent text-accent-foreground border-0 font-medium">
                      {teacher.classroom.name}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground hidden md:table-cell tabular">
                  {formatDate(teacher.created_at)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={teacher.is_active ? 'default' : 'secondary'}
                    className={teacher.is_active
                      ? 'bg-success/15 text-success hover:bg-success/15 border-0 gap-1.5'
                      : 'bg-muted text-muted-foreground border-0 gap-1.5'
                    }
                  >
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        teacher.is_active ? 'bg-success animate-pulse-dot' : 'bg-muted-foreground/50'
                      }`}
                    />
                    {teacher.is_active ? 'Active' : 'Inactive'}
                  </Badge>
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
                        onClick={() => {
                          setSelected(teacher)
                          setConfirmOpen(true)
                        }}
                      >
                        <Power className="mr-2 h-4 w-4" />
                        {teacher.is_active ? 'Deactivate' : 'Activate'}
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
        title={selected?.is_active ? 'Deactivate Teacher' : 'Activate Teacher'}
        description={`Are you sure you want to ${selected?.is_active ? 'deactivate' : 'activate'} ${selected?.full_name}?`}
        confirmLabel={selected?.is_active ? 'Deactivate' : 'Activate'}
        onConfirm={handleToggleStatus}
        loading={loading}
        variant={selected?.is_active ? 'destructive' : 'default'}
      />
    </>
  )
}
