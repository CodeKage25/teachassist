'use client'

import { useState } from 'react'
import { getAttendanceInsights } from '@/lib/actions/ai'
import { Button } from '@/components/ui/button'
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react'

interface AIInsightsWidgetProps {
  schoolId: string
}

export function AIInsightsWidget({ schoolId }: AIInsightsWidgetProps) {
  const [insight, setInsight] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    const result = await getAttendanceInsights(schoolId)
    setLoading(false)
    setGenerated(true)
    if (result.error) {
      setError(result.error)
    } else {
      setInsight(result.insight)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900">AI Attendance Insights</h2>
            <p className="text-xs text-slate-400">Analyses the last 30 days of attendance data</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleGenerate}
          disabled={loading}
          className="h-8 text-slate-700 border-slate-300 hover:bg-slate-50 flex-shrink-0"
        >
          {loading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              {generated ? (
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              )}
              {generated ? 'Refresh' : 'Generate insights'}
            </>
          )}
        </Button>
      </div>

      {!generated && !loading && (
        <p className="text-sm text-slate-400 leading-relaxed">
          Click &ldquo;Generate insights&rdquo; to get an AI analysis of your school&apos;s attendance
          patterns — including at-risk students and actionable recommendations.
        </p>
      )}

      {loading && (
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          Analysing attendance data...
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {insight && !loading && (
        <p className="text-sm leading-relaxed text-slate-700">{insight}</p>
      )}
    </div>
  )
}
