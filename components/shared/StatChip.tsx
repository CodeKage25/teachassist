import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatChipProps {
  icon: LucideIcon
  label: string
  value: number | string
  tone?: 'default' | 'success' | 'warning' | 'muted'
}

const tones = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-warning-foreground',
  muted: 'bg-muted text-muted-foreground',
}

/** Compact inline summary stat, for rows above tables. */
export function StatChip({ icon: Icon, label, value, tone = 'default' }: StatChipProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', tones[tone])}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0">
        <p className="font-display text-xl font-semibold leading-none tabular">{value}</p>
        <p className="text-xs text-muted-foreground mt-1 truncate">{label}</p>
      </div>
    </div>
  )
}
