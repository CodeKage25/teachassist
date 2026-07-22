'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteAttendanceForDate } from '@/lib/actions/attendance'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { CalendarDays, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react'

export interface AttendanceDaySummary {
  date: string
  present: number
  absent: number
  late: number
}

interface Props {
  classroomId: string
  days: AttendanceDaySummary[]
  selectedDate: string
  today: string
}

function formatDay(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function AttendanceHistory({ classroomId, days, selectedDate, today }: Props) {
  const router = useRouter()
  const [confirmDate, setConfirmDate] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirmDate) return
    setDeleting(true)
    const result = await deleteAttendanceForDate(classroomId, confirmDate)
    setDeleting(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(`Attendance for ${formatDay(confirmDate)} deleted`)
      setConfirmDate(null)
      router.refresh()
    }
  }

  if (days.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
        <CalendarDays className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No attendance recorded yet. Marked days will appear here.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
        {days.map((day) => {
          const isSelected = day.date === selectedDate
          const total = day.present + day.absent + day.late
          return (
            <div
              key={day.date}
              className={cn(
                'group relative rounded-2xl border bg-card p-4 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5',
                isSelected ? 'border-primary/50 ring-1 ring-primary/25' : 'border-border hover:border-primary/25'
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <Link
                  href={`?date=${day.date}`}
                  className="min-w-0"
                  title="Open this day"
                >
                  <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {formatDay(day.date)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {day.date === today ? 'Today · ' : ''}
                    {total} record{total !== 1 ? 's' : ''}
                  </p>
                </Link>
                <button
                  type="button"
                  onClick={() => setConfirmDate(day.date)}
                  title="Delete this day's attendance"
                  className="flex-shrink-0 rounded-lg p-1.5 text-muted-foreground opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Ratio bar */}
              <div className="flex h-1.5 rounded-full overflow-hidden bg-muted mb-3" aria-hidden>
                {day.present > 0 && (
                  <div className="bg-success" style={{ width: `${(day.present / total) * 100}%` }} />
                )}
                {day.late > 0 && (
                  <div className="bg-warning" style={{ width: `${(day.late / total) * 100}%` }} />
                )}
                {day.absent > 0 && (
                  <div className="bg-destructive" style={{ width: `${(day.absent / total) * 100}%` }} />
                )}
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 text-success font-medium tabular">
                  <CheckCircle2 className="h-3 w-3" /> {day.present}
                </span>
                <span className="inline-flex items-center gap-1 text-warning font-medium tabular">
                  <Clock className="h-3 w-3" /> {day.late}
                </span>
                <span className="inline-flex items-center gap-1 text-destructive font-medium tabular">
                  <XCircle className="h-3 w-3" /> {day.absent}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <ConfirmDialog
        open={confirmDate !== null}
        onOpenChange={(open) => !open && setConfirmDate(null)}
        title="Delete attendance for this day"
        description={`This permanently removes every record marked on ${confirmDate ? formatDay(confirmDate) : ''}. Use this to correct a day marked by mistake.`}
        confirmLabel="Delete day"
        onConfirm={handleDelete}
        loading={deleting}
        variant="destructive"
      />
    </>
  )
}
