'use client'

import { useState } from 'react'
import { recordAttendance } from '@/lib/actions/attendance'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn, todayISO } from '@/lib/utils'
import { Save, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import type { AttendanceStatus } from '@/types/database'

interface Student {
  id: string
  full_name: string
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
    color: 'text-green-600',
    selected: 'bg-green-500 text-white border-green-500',
  },
  {
    value: 'absent',
    label: 'Absent',
    icon: XCircle,
    color: 'text-red-500',
    selected: 'bg-red-500 text-white border-red-500',
  },
  {
    value: 'late',
    label: 'Late',
    icon: Clock,
    color: 'text-amber-500',
    selected: 'bg-amber-500 text-white border-amber-500',
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
          { label: 'Present', count: presentCount, color: 'text-green-700 bg-green-50 border-green-100' },
          { label: 'Absent', count: absentCount, color: 'text-red-700 bg-red-50 border-red-100' },
          { label: 'Late', count: lateCount, color: 'text-amber-700 bg-amber-50 border-amber-100' },
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
          className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-100 transition-colors"
        >
          All Present
        </button>
        <button
          onClick={() => markAll('absent')}
          className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100 transition-colors"
        >
          All Absent
        </button>
      </div>

      {/* Student rows */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {students.map((student, i) => {
          const current = attendance[student.id]

          return (
            <div
              key={student.id}
              className={cn(
                'flex items-center gap-4 px-4 sm:px-6 py-3.5',
                i !== 0 && 'border-t border-border',
                'hover:bg-slate-50/50 transition-colors'
              )}
            >
              {/* Student info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center text-xs font-bold text-purple-700 flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </div>
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
                        : 'border-border text-muted-foreground hover:border-slate-300 hover:bg-slate-50'
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
          className="bg-purple-600 hover:bg-purple-700 px-6"
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
