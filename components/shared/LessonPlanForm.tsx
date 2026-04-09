'use client'

import { useState, useRef } from 'react'
import { generateLessonPlan } from '@/lib/actions/ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sparkles, Loader2, Copy, Check, Upload, X, FileText } from 'lucide-react'
import { toast } from 'sonner'

export function LessonPlanForm() {
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
    if (file.type === 'text/plain') return file.text()
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
          texts.push(content.items.map((item: any) => item.str).join(' '))
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

  return (
    <div className="bg-white rounded-2xl border border-border p-6 space-y-5 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="subject" className="text-sm font-medium text-slate-700">Subject *</Label>
          <Input
            id="subject"
            placeholder="e.g. Mathematics"
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="topic" className="text-sm font-medium text-slate-700">Topic *</Label>
          <Input
            id="topic"
            placeholder="e.g. Introduction to Fractions"
            value={form.topic}
            onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="grade" className="text-sm font-medium text-slate-700">Grade Level *</Label>
          <Input
            id="grade"
            placeholder="e.g. Grade 5 / Year 9"
            value={form.gradeLevel}
            onChange={(e) => setForm((f) => ({ ...f, gradeLevel: e.target.value }))}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="duration" className="text-sm font-medium text-slate-700">Duration</Label>
          <Input
            id="duration"
            placeholder="e.g. 45 minutes"
            value={form.duration}
            onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="objectives" className="text-sm font-medium text-slate-700">
            Specific Objectives{' '}
            <span className="text-slate-400 font-normal text-xs">(optional)</span>
          </Label>
          <Textarea
            id="objectives"
            placeholder="Any specific learning goals or requirements..."
            value={form.objectives}
            onChange={(e) => setForm((f) => ({ ...f, objectives: e.target.value }))}
            className="h-20 resize-none"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-sm font-medium text-slate-700">
            Scheme of Work{' '}
            <span className="text-slate-400 font-normal text-xs">(optional — PDF or TXT)</span>
          </Label>
          {schemeFile ? (
            <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-slate-200 bg-slate-50">
              <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm text-slate-700 flex-1 truncate">{schemeFile.name}</span>
              <button
                type="button"
                onClick={() => {
                  setSchemeFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 h-10 px-3 w-full rounded-lg border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm text-slate-500 hover:text-blue-600 cursor-pointer"
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
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setSchemeFile(file)
            }}
          />
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={loading || extracting}
        className="bg-blue-700 hover:bg-blue-800 text-white w-full h-11 cursor-pointer"
      >
        {extracting ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />Reading file...</>
        ) : loading ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating lesson plan...</>
        ) : (
          <><Sparkles className="h-4 w-4 mr-2" />Generate Lesson Plan</>
        )}
      </Button>

      {plan && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Lesson plan ready</p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="h-8 text-xs border-slate-300 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              {copied ? (
                <Check className="h-3 w-3 mr-1 text-teal-600" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <ScrollArea className="h-80 rounded-xl bg-slate-50 border border-slate-200">
            <div className="p-4">
              <pre className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap font-sans">
                {plan}
              </pre>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
