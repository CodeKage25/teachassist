'use client'

import { useState } from 'react'
import { recordAttendance } from '@/lib/actions/attendance'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Save, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import type { AttendanceStatus } from '@/types/database'

interface Student {
  id: string
  full_name: string
  photo_url?: string | null
}

interface Props {
  classroomId: string
  students: Student[]
  date: string
  existingRecords?: Record<string, AttendanceStatus>
}

const statuses: { value: AttendanceStatus; label: string; icon: typeof CheckCircle2; color: string; selected: string }[] = [
  {
    value: 'present',
    label: 'Present',
    icon: CheckCircle2,
    color: 'text-success',
    selected: 'bg-success text-success-foreground border-success',
  },
  {
    value: 'absent',
    label: 'Absent',
    icon: XCircle,
    color: 'text-destructive',
    selected: 'bg-destructive text-destructive-foreground border-destructive',
  },
  {
    value: 'late',
    label: 'Late',
    icon: Clock,
    color: 'text-warning',
    selected: 'bg-warning text-warning-foreground border-warning',
  },
]

export function AttendanceSheet({
  classroomId,
  students,
  date,
  existingRecords = {},
}: Props) {
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    existingRecords
  )
  const [saving, setSaving] = useState(false)

  function setStatus(studentId: string, status: AttendanceStatus) {
    setAttendance((prev) => ({ ...prev, [studentId]: status }))
  }

  function markAll(status: AttendanceStatus) {
    const all: Record<string, AttendanceStatus> = {}
    students.forEach((s) => (all[s.id] = status))
    setAttendance(all)
    toast.info(`All students marked as ${status}`)
  }

  async function handleSave() {
    const records = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status,
    }))

    if (records.length === 0) {
      toast.warning('Please mark attendance for at least one student')
      return
    }

    setSaving(true)
    const result = await recordAttendance(classroomId, date, records)
    setSaving(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Attendance saved successfully!')
    }
  }

  const presentCount = Object.values(attendance).filter((s) => s === 'present').length
  const absentCount = Object.values(attendance).filter((s) => s === 'absent').length
  const lateCount = Object.values(attendance).filter((s) => s === 'late').length

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Present', count: presentCount, color: 'text-success bg-success/10 border-success/20' },
          { label: 'Absent', count: absentCount, color: 'text-destructive bg-destructive/10 border-destructive/20' },
          { label: 'Late', count: lateCount, color: 'text-warning bg-warning/10 border-warning/20' },
        ].map((s) => (
          <div
            key={s.label}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium',
              s.color
            )}
          >
            <span className="font-black text-base">{s.count}</span>
            {s.label}
          </div>
        ))}
        <div className="ml-auto text-sm text-muted-foreground self-center">
          {Object.keys(attendance).length} / {students.length} marked
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground self-center">Mark all as:</span>
        <button
          onClick={() => markAll('present')}
          className="text-xs font-semibold text-success bg-success/10 border border-success/30 rounded-lg px-3 py-1.5 hover:bg-success/15 transition-colors"
        >
          All Present
        </button>
        <button
          onClick={() => markAll('absent')}
          className="text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-1.5 hover:bg-destructive/15 transition-colors"
        >
          All Absent
        </button>
      </div>

      {/* Student rows */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {students.map((student, i) => {
          const current = attendance[student.id]

          return (
            <div
              key={student.id}
              className={cn(
                'flex items-center gap-4 px-4 sm:px-6 py-3.5',
                i !== 0 && 'border-t border-border',
                'hover:bg-muted/30 transition-colors'
              )}
            >
              {/* Student info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="w-6 text-xs font-semibold text-muted-foreground tabular flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {student.photo_url ? (
                  <img
                    src={student.photo_url}
                    alt={student.full_name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center text-[10px] font-bold text-primary-foreground flex-shrink-0 shadow-xs">
                    {student.full_name
                      .split(' ')
                      .map((n) => n.charAt(0))
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </div>
                )}
                <p className="font-medium text-sm truncate">{student.full_name}</p>
              </div>

              {/* Status toggles */}
              <div className="flex gap-1.5 flex-shrink-0">
                {statuses.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStatus(student.id, s.value)}
                    title={s.label}
                    className={cn(
                      'w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5',
                      current === s.value
                        ? s.selected
                        : 'border-border text-muted-foreground hover:border-border hover:bg-muted/50'
                    )}
                  >
                    <s.icon className={cn('h-3.5 w-3.5', current !== s.value && s.color)} />
                    <span className="hidden sm:inline">
                      {current === s.value ? s.label : s.label[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || Object.keys(attendance).length === 0}
          className="bg-primary hover:bg-primary/90 px-6 cursor-pointer"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Attendance
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
