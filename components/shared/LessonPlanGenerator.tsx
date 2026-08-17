'use client'

import { useState, useRef } from 'react'
import { generateLessonPlan } from '@/lib/actions/ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Sparkles, Loader2, Copy, Check, Upload, X, FileText, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export function LessonPlanGenerator() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [schemeFile, setSchemeFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    subject: '',
    topic: '',
    gradeLevel: '',
    duration: '45 minutes',
    objectives: '',
  })

  async function extractTextFromFile(file: File): Promise<string> {
    if (file.type === 'text/plain') {
      return file.text()
    }
    if (file.type === 'application/pdf') {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        const texts: string[] = []
        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          texts.push(content.items.map((item) => item.str).join(' '))
        }
        return texts.join('\n')
      } catch {
        return `[Scheme of work file: ${file.name}]`
      }
    }
    return `[Scheme of work file: ${file.name}]`
  }

  async function handleGenerate() {
    if (!form.subject || !form.topic || !form.gradeLevel) {
      toast.warning('Please fill in Subject, Topic, and Grade Level')
      return
    }

    let schemeContent: string | undefined
    if (schemeFile) {
      setExtracting(true)
      schemeContent = await extractTextFromFile(schemeFile)
      setExtracting(false)
    }

    setLoading(true)
    setPlan(null)
    const result = await generateLessonPlan({ ...form, schemeContent })
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      setPlan(result.plan)
    }
  }

  async function handleCopy() {
    if (!plan) return
    await navigator.clipboard.writeText(plan)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSchemeFile(file)
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className="bg-white/15 backdrop-blur border-white/25 text-white hover:bg-white/25 hover:text-white hover:-translate-y-0.5 shadow-sm flex-shrink-0 cursor-pointer transition-all duration-300"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        AI Lesson Planner
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              AI Lesson Plan Generator
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Fill in the details below and get a structured lesson plan in seconds.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4 min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-xs font-semibold text-foreground/80">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g. Mathematics"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="topic" className="text-xs font-semibold text-foreground/80">Topic *</Label>
                <Input
                  id="topic"
                  placeholder="e.g. Introduction to Fractions"
                  value={form.topic}
                  onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="grade" className="text-xs font-semibold text-foreground/80">Grade Level *</Label>
                <Input
                  id="grade"
                  placeholder="e.g. Grade 5 / Year 9"
                  value={form.gradeLevel}
                  onChange={(e) => setForm((f) => ({ ...f, gradeLevel: e.target.value }))}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="duration" className="text-xs font-semibold text-foreground/80">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g. 45 minutes"
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="objectives" className="text-xs font-semibold text-foreground/80">
                  Specific Objectives{' '}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="objectives"
                  placeholder="Any specific learning goals or requirements..."
                  value={form.objectives}
                  onChange={(e) => setForm((f) => ({ ...f, objectives: e.target.value }))}
                  className="h-16 resize-none"
                />
              </div>

              {/* Scheme of Work file upload */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-foreground/80">
                  Scheme of Work{' '}
                  <span className="text-muted-foreground font-normal">(optional — PDF or TXT)</span>
                </Label>
                {schemeFile ? (
                  <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-muted/50">
                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground/80 flex-1 truncate">{schemeFile.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSchemeFile(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 h-9 px-3 w-full rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-primary/10 transition-colors text-sm text-muted-foreground hover:text-primary cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                    Upload scheme of work file
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || extracting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full cursor-pointer"
            >
              {extracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Reading file...
                </>
              ) : loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating lesson plan...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Lesson Plan
                </>
              )}
            </Button>

            {loading && (
              <div
                className="rounded-xl border border-border bg-muted/40 p-4 space-y-2.5"
                role="status"
                aria-label="Generating lesson plan"
              >
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  Drafting your lesson plan…
                </div>
                {[100, 83, 91, 66].map((w, i) => (
                  <div
                    key={i}
                    className="h-2.5 rounded-full bg-muted animate-pulse"
                    style={{ width: `${w}%`, animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            )}

            {plan && !loading && (
              <div className="flex-1 min-h-0 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground/80">Lesson plan ready</p>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleGenerate}
                      className="h-7 text-xs border-border text-muted-foreground hover:bg-muted/50 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Regenerate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                      className="h-7 text-xs border-border text-muted-foreground hover:bg-muted/50 cursor-pointer"
                    >
                      {copied ? (
                        <Check className="h-3 w-3 mr-1 text-success" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
                <ScrollArea className="flex-1 min-h-0 max-h-64 rounded-xl bg-muted/50 border border-border">
                  <div className="p-4">
                    <pre className="text-xs leading-relaxed text-foreground/80 whitespace-pre-wrap font-sans">
                      {plan}
                    </pre>
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
