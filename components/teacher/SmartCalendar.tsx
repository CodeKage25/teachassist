'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Clock, BookOpen, FileText, Users, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

// ─── Types ───────────────────────────────────────────────────────────────────

type EventType = 'class' | 'exam' | 'meeting' | 'other'

interface CalendarEvent {
  id: string
  title: string
  date: string      // YYYY-MM-DD
  time: string      // HH:MM
  description: string
  type: EventType
  classroom?: string
  createdAt: string
}

interface EventFormData {
  title: string
  date: string
  time: string
  description: string
  type: EventType
  classroom: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'calendar_events'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const EVENT_COLORS: Record<EventType, {
  badge: string
  dot: string
  label: string
  icon: React.ElementType
}> = {
  class:   { badge: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500',   label: 'Class',   icon: BookOpen       },
  exam:    { badge: 'bg-red-100 text-red-700 border-red-200',          dot: 'bg-red-500',    label: 'Exam',    icon: FileText       },
  meeting: { badge: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500', label: 'Meeting', icon: Users          },
  other:   { badge: 'bg-slate-100 text-slate-700 border-slate-200',    dot: 'bg-slate-400',  label: 'Other',   icon: MoreHorizontal },
}

const EMPTY_FORM: EventFormData = {
  title: '',
  date: '',
  time: '',
  description: '',
  type: 'class',
  classroom: '',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function todayKey(): string {
  const d = new Date()
  return toDateKey(d.getFullYear(), d.getMonth(), d.getDate())
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`
}

function formatTime(timeStr: string): string {
  if (!timeStr) return ''
  const [h, min] = timeStr.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(min).padStart(2, '0')} ${ampm}`
}

function loadEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CalendarEvent[]) : []
  } catch {
    return []
  }
}

function saveEvents(events: CalendarEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
}

function generateId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EventTypeBadge({ type }: { type: EventType }) {
  const config = EVENT_COLORS[type]
  return (
    <Badge variant="outline" className={`text-xs font-medium ${config.badge}`}>
      {config.label}
    </Badge>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SmartCalendar() {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [events, setEvents] = useState<CalendarEvent[]>([])

  // Dialog state
  const [addOpen, setAddOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [form, setForm] = useState<EventFormData>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof EventFormData, string>>>({})

  // Load from localStorage on mount
  useEffect(() => {
    setEvents(loadEvents())
  }, [])

  // ── Navigation ──────────────────────────────────────────────────────────────

  const prevMonth = useCallback(() => {
    setCurrentMonth((m) => {
      if (m === 0) { setCurrentYear((y) => y - 1); return 11 }
      return m - 1
    })
  }, [])

  const nextMonth = useCallback(() => {
    setCurrentMonth((m) => {
      if (m === 11) { setCurrentYear((y) => y + 1); return 0 }
      return m + 1
    })
  }, [])

  const goToday = useCallback(() => {
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Calendar grid ───────────────────────────────────────────────────────────

  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const todayStr = todayKey()

  // Map dateKey -> events for quick lookup
  const eventsByDate = events.reduce<Record<string, CalendarEvent[]>>((acc, evt) => {
    acc[evt.date] = acc[evt.date] ? [...acc[evt.date], evt] : [evt]
    return acc
  }, {})

  // Build grid cells: null = empty leading cell
  const gridCells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete last row
  while (gridCells.length % 7 !== 0) gridCells.push(null)

  // ── Form helpers ────────────────────────────────────────────────────────────

  function openAddDialog(prefillDate?: string) {
    setForm({ ...EMPTY_FORM, date: prefillDate ?? '' })
    setFormErrors({})
    setAddOpen(true)
  }

  function updateField<K extends keyof EventFormData>(key: K, value: EventFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFormErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validateForm(): boolean {
    const errors: Partial<Record<keyof EventFormData, string>> = {}
    if (!form.title.trim()) errors.title = 'Title is required'
    if (!form.date) errors.date = 'Date is required'
    if (!form.time) errors.time = 'Time is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  function handleAddEvent() {
    if (!validateForm()) return

    const newEvent: CalendarEvent = {
      id: generateId(),
      title: form.title.trim(),
      date: form.date,
      time: form.time,
      description: form.description.trim(),
      type: form.type,
      classroom: form.classroom.trim() || undefined,
      createdAt: new Date().toISOString(),
    }

    const updated = [...events, newEvent]
    setEvents(updated)
    saveEvents(updated)
    setAddOpen(false)
    toast.success('Event added to calendar')
  }

  function handleDeleteEvent(id: string) {
    const updated = events.filter((e) => e.id !== id)
    setEvents(updated)
    saveEvents(updated)
    setDetailOpen(false)
    setSelectedEvent(null)
    toast.success('Event deleted')
  }

  function openEventDetail(evt: CalendarEvent, e: React.MouseEvent) {
    e.stopPropagation()
    setSelectedEvent(evt)
    setDetailOpen(true)
  }

  // ── Upcoming events (next 10 from today, sorted) ────────────────────────────

  const upcoming = [...events]
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => {
      const da = `${a.date}T${a.time}`
      const db = `${b.date}T${b.time}`
      return da.localeCompare(db)
    })
    .slice(0, 10)

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex flex-col xl:flex-row gap-6">
        {/* ── Calendar panel ── */}
        <Card className="flex-1 min-w-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Month navigation */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-bold min-w-[180px] text-center">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h2>
                <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToday} className="ml-1 text-xs">
                  Today
                </Button>
              </div>

              {/* Add event */}
              <Button
                onClick={() => openAddDialog()}
                size="sm"
                className="bg-blue-700 hover:bg-blue-800 text-white gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 pb-4">
            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {DAY_NAMES.map((d) => (
                <div
                  key={d}
                  className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7">
              {gridCells.map((day, idx) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[90px] border-b border-r border-border bg-slate-50/50"
                    />
                  )
                }

                const dateKey = toDateKey(currentYear, currentMonth, day)
                const isToday = dateKey === todayStr
                const dayEvents = eventsByDate[dateKey] ?? []
                // Remove border-r on last column of each row
                const isLastCol = (idx + 1) % 7 === 0

                return (
                  <div
                    key={dateKey}
                    onClick={() => openAddDialog(dateKey)}
                    className={[
                      'min-h-[90px] border-b border-border p-1.5 cursor-pointer transition-colors hover:bg-blue-50/40',
                      isLastCol ? '' : 'border-r',
                    ].join(' ')}
                  >
                    {/* Day number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={[
                          'inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium transition-colors',
                          isToday
                            ? 'bg-blue-700 text-white font-bold'
                            : 'text-slate-700',
                        ].join(' ')}
                      >
                        {day}
                      </span>
                      {dayEvents.length > 1 && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0 leading-none">
                          {dayEvents.length}
                        </Badge>
                      )}
                    </div>

                    {/* Events (show up to 2, rest indicated) */}
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map((evt) => {
                        const config = EVENT_COLORS[evt.type]
                        return (
                          <button
                            key={evt.id}
                            onClick={(e) => openEventDetail(evt, e)}
                            className={[
                              'w-full text-left text-[10px] font-medium px-1.5 py-0.5 rounded truncate',
                              'border transition-opacity hover:opacity-80',
                              config.badge,
                            ].join(' ')}
                          >
                            {evt.title}
                          </button>
                        )
                      })}
                      {dayEvents.length > 2 && (
                        <p className="text-[10px] text-muted-foreground px-1">
                          +{dayEvents.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Upcoming Events sidebar ── */}
        <Card className="w-full xl:w-72 flex-shrink-0 self-start">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-700" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[480px]">
              {upcoming.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No upcoming events</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Add an event to get started
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {upcoming.map((evt) => {
                    const config = EVENT_COLORS[evt.type]
                    return (
                      <button
                        key={evt.id}
                        onClick={() => { setSelectedEvent(evt); setDetailOpen(true) }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                              {evt.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-muted-foreground">
                                {formatDisplayDate(evt.date)}
                              </span>
                              {evt.time && (
                                <>
                                  <span className="text-muted-foreground/40">·</span>
                                  <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                    <Clock className="h-2.5 w-2.5" />
                                    {formatTime(evt.time)}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="mt-1.5">
                              <EventTypeBadge type={evt.type} />
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* ── Add Event Dialog ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-700" />
              Add New Event
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="evt-title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="evt-title"
                placeholder="e.g. Math Class, Biology Exam…"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                className={formErrors.title ? 'border-red-400' : ''}
              />
              {formErrors.title && (
                <p className="text-xs text-red-500">{formErrors.title}</p>
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="evt-date">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="evt-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  className={formErrors.date ? 'border-red-400' : ''}
                />
                {formErrors.date && (
                  <p className="text-xs text-red-500">{formErrors.date}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="evt-time">
                  Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="evt-time"
                  type="time"
                  value={form.time}
                  onChange={(e) => updateField('time', e.target.value)}
                  className={formErrors.time ? 'border-red-400' : ''}
                />
                {formErrors.time && (
                  <p className="text-xs text-red-500">{formErrors.time}</p>
                )}
              </div>
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <Label htmlFor="evt-type">Event Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => updateField('type', v as EventType)}
              >
                <SelectTrigger id="evt-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Classroom (optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="evt-classroom">
                Classroom{' '}
                <span className="text-muted-foreground text-xs font-normal">(optional)</span>
              </Label>
              <Input
                id="evt-classroom"
                placeholder="e.g. Room 101, Lab A…"
                value={form.classroom}
                onChange={(e) => updateField('classroom', e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="evt-description">
                Description{' '}
                <span className="text-muted-foreground text-xs font-normal">(optional)</span>
              </Label>
              <Textarea
                id="evt-description"
                placeholder="Add notes or details about this event…"
                rows={3}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddEvent}
              className="bg-blue-700 hover:bg-blue-800 text-white"
            >
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Event Detail Dialog ── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[420px]">
          {selectedEvent && (() => {
            const config = EVENT_COLORS[selectedEvent.type]
            const Icon = config.icon
            return (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 p-2 rounded-lg ${config.badge} flex-shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <DialogTitle className="text-base leading-tight">
                        {selectedEvent.title}
                      </DialogTitle>
                      <div className="mt-1.5">
                        <EventTypeBadge type={selectedEvent.type} />
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-3 py-1">
                  <Separator />

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                        Date
                      </p>
                      <p className="font-medium">{formatDisplayDate(selectedEvent.date)}</p>
                    </div>
                    {selectedEvent.time && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                          Time
                        </p>
                        <p className="font-medium">{formatTime(selectedEvent.time)}</p>
                      </div>
                    )}
                  </div>

                  {selectedEvent.classroom && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                        Classroom
                      </p>
                      <p className="text-sm font-medium">{selectedEvent.classroom}</p>
                    </div>
                  )}

                  {selectedEvent.description && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                        Description
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {selectedEvent.description}
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setDetailOpen(false)}>
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="gap-1.5"
                  >
                    <X className="h-4 w-4" />
                    Delete Event
                  </Button>
                </DialogFooter>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </>
  )
}
