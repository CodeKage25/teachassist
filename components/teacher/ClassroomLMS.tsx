'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FileText,
  Video,
  Link as LinkIcon,
  BookOpen,
  Users,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type MaterialType = 'document' | 'video' | 'link'

interface Material {
  id: string
  title: string
  description: string
  type: MaterialType
  url: string
  createdAt: string
}

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  points: number
  createdAt: string
}

type Tab = 'students' | 'materials' | 'assignments'

interface Student {
  id: string
  name: string
  email?: string
}

interface ClassroomLMSProps {
  classroomId: string
  classroomName: string
  students: Student[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function materialIcon(type: MaterialType) {
  switch (type) {
    case 'document':
      return <FileText className="h-5 w-5 text-blue-600" />
    case 'video':
      return <Video className="h-5 w-5 text-purple-600" />
    case 'link':
      return <LinkIcon className="h-5 w-5 text-emerald-600" />
  }
}

function materialBg(type: MaterialType): string {
  switch (type) {
    case 'document':
      return 'bg-blue-50'
    case 'video':
      return 'bg-purple-50'
    case 'link':
      return 'bg-emerald-50'
  }
}

function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date(new Date().toDateString())
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ─── Add Material Dialog ──────────────────────────────────────────────────────

interface AddMaterialDialogProps {
  onAdd: (material: Omit<Material, 'id' | 'createdAt'>) => void
}

function AddMaterialDialog({ onAdd }: AddMaterialDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<MaterialType>('document')
  const [url, setUrl] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return
    onAdd({ title: title.trim(), description: description.trim(), type, url: url.trim() })
    setTitle('')
    setDescription('')
    setType('document')
    setUrl('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-700 hover:bg-blue-800 text-white cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Add Material
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Learning Material</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="mat-title">Title</Label>
            <Input
              id="mat-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 3 Notes"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mat-desc">Description</Label>
            <Textarea
              id="mat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this material…"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mat-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as MaterialType)}>
              <SelectTrigger id="mat-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="link">Link</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mat-url">URL</Label>
            <Input
              id="mat-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white">
              Add Material
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Add Assignment Dialog ────────────────────────────────────────────────────

interface AddAssignmentDialogProps {
  onAdd: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => void
}

function AddAssignmentDialog({ onAdd }: AddAssignmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [points, setPoints] = useState<string>('100')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !dueDate) return
    onAdd({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      points: Number(points) || 0,
    })
    setTitle('')
    setDescription('')
    setDueDate('')
    setPoints('100')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-700 hover:bg-blue-800 text-white cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Add Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Assignment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="asgn-title">Title</Label>
            <Input
              id="asgn-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Homework #1"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="asgn-desc">Description</Label>
            <Textarea
              id="asgn-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions or details…"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="asgn-due">Due Date</Label>
              <Input
                id="asgn-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="asgn-pts">Points</Label>
              <Input
                id="asgn-pts"
                type="number"
                min="0"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="100"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white">
              Create Assignment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ClassroomLMS({ classroomId, classroomName: _classroomName, students }: ClassroomLMSProps) {
  const [activeTab, setActiveTab] = useState<Tab>('students')
  const [materials, setMaterials] = useState<Material[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])

  // Hydrate from localStorage after mount
  useEffect(() => {
    try {
      const rawMaterials = localStorage.getItem(`materials_${classroomId}`)
      if (rawMaterials) setMaterials(JSON.parse(rawMaterials) as Material[])
    } catch {
      // ignore parse errors
    }
    try {
      const rawAssignments = localStorage.getItem(`assignments_${classroomId}`)
      if (rawAssignments) setAssignments(JSON.parse(rawAssignments) as Assignment[])
    } catch {
      // ignore parse errors
    }
  }, [classroomId])

  function saveMaterials(next: Material[]) {
    setMaterials(next)
    localStorage.setItem(`materials_${classroomId}`, JSON.stringify(next))
  }

  function saveAssignments(next: Assignment[]) {
    setAssignments(next)
    localStorage.setItem(`assignments_${classroomId}`, JSON.stringify(next))
  }

  function addMaterial(data: Omit<Material, 'id' | 'createdAt'>) {
    const next: Material = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    saveMaterials([...materials, next])
  }

  function deleteMaterial(id: string) {
    saveMaterials(materials.filter((m) => m.id !== id))
  }

  function addAssignment(data: Omit<Assignment, 'id' | 'createdAt'>) {
    const next: Assignment = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    saveAssignments([...assignments, next])
  }

  function deleteAssignment(id: string) {
    saveAssignments(assignments.filter((a) => a.id !== id))
  }

  const sortedAssignments = [...assignments].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      key: 'students',
      label: 'Students',
      icon: <Users className="h-4 w-4" />,
      count: students.length,
    },
    {
      key: 'materials',
      label: 'Materials',
      icon: <FileText className="h-4 w-4" />,
      count: materials.length,
    },
    {
      key: 'assignments',
      label: 'Assignments',
      icon: <BookOpen className="h-4 w-4" />,
      count: assignments.length,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={[
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2',
              activeTab === tab.key
                ? 'border-blue-700 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-slate-50',
            ].join(' ')}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <Badge
                variant={activeTab === tab.key ? 'default' : 'secondary'}
                className={[
                  'text-xs px-1.5 py-0',
                  activeTab === tab.key ? 'bg-blue-700 hover:bg-blue-700' : '',
                ].join(' ')}
              >
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Students Tab */}
      {activeTab === 'students' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4 px-6">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Enrolled Students
            </CardTitle>
            <Badge variant="secondary">
              {students.length} student{students.length !== 1 ? 's' : ''}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            {students.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No students enrolled in this classroom yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-semibold w-12">#</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, i) => (
                    <TableRow key={student.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-muted-foreground text-sm font-mono">
                        {String(i + 1).padStart(2, '0')}
                      </TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {student.email ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {materials.length === 0
                ? 'No materials added yet.'
                : `${materials.length} material${materials.length !== 1 ? 's' : ''}`}
            </p>
            <AddMaterialDialog onAdd={addMaterial} />
          </div>

          {materials.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((mat) => (
                <Card key={mat.id} className="flex flex-col">
                  <CardHeader className="flex flex-row items-start gap-3 pb-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${materialBg(mat.type)}`}
                    >
                      {materialIcon(mat.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm leading-tight truncate">{mat.title}</p>
                      <Badge variant="secondary" className="text-xs mt-1 capitalize">
                        {mat.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-3 pt-0">
                    {mat.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{mat.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-auto">
                      <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
                        <a href={mat.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                          Open
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
                        onClick={() => deleteMaterial(mat.id)}
                        aria-label="Delete material"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {assignments.length === 0
                ? 'No assignments created yet.'
                : `${assignments.length} assignment${assignments.length !== 1 ? 's' : ''}`}
            </p>
            <AddAssignmentDialog onAdd={addAssignment} />
          </div>

          {sortedAssignments.length > 0 && (
            <div className="space-y-3">
              {sortedAssignments.map((asgn) => {
                const overdue = isOverdue(asgn.dueDate)
                return (
                  <Card key={asgn.id}>
                    <CardContent className="flex items-start gap-4 py-4 px-5">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                        <BookOpen className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{asgn.title}</p>
                          {overdue && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        {asgn.description && (
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                            {asgn.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span>Due {formatDate(asgn.dueDate)}</span>
                          <span>·</span>
                          <span>{asgn.points} pts</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 px-2 shrink-0"
                        onClick={() => deleteAssignment(asgn.id)}
                        aria-label="Delete assignment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
