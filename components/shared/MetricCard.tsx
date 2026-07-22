import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  description?: string
  color?: 'blue' | 'teal' | 'slate' | 'green' | 'amber'
}

const colorMap = {
  blue: { chip: 'bg-primary/10 text-primary', glow: 'from-primary/8', wave: 'text-primary' },
  teal: { chip: 'bg-chart-4/10 text-chart-4', glow: 'from-chart-4/8', wave: 'text-chart-4' },
  slate: { chip: 'bg-muted text-muted-foreground', glow: 'from-muted/60', wave: 'text-muted-foreground' },
  green: { chip: 'bg-success/10 text-success', glow: 'from-success/8', wave: 'text-success' },
  amber: { chip: 'bg-warning/15 text-warning-foreground', glow: 'from-warning/10', wave: 'text-warning' },
}

/* Deterministic decorative wave per card title — ambience, not data. */
function wavePath(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 997
  const pts: number[] = []
  for (let i = 0; i <= 6; i++) {
    h = (h * 137 + 71) % 997
    pts.push(10 + (h % 16))
  }
  let d = `M0 ${pts[0]}`
  for (let i = 1; i <= 6; i++) {
    const x = i * 20
    const px = x - 10
    d += ` C${px} ${pts[i - 1]}, ${px} ${pts[i]}, ${x} ${pts[i]}`
  }
  return d
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  color = 'blue',
}: MetricCardProps) {
  const colors = colorMap[color]
  const d = wavePath(title)

  return (
    <div className="group relative overflow-hidden bg-card rounded-2xl border border-border p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/25">
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          colors.glow
        )}
      />
      {/* Decorative wave, bottom edge */}
      <svg
        aria-hidden
        viewBox="0 0 120 32"
        preserveAspectRatio="none"
        className={cn(
          'pointer-events-none absolute bottom-0 left-0 w-full h-10 opacity-[0.1] transition-opacity duration-300 group-hover:opacity-[0.18]',
          colors.wave
        )}
      >
        <path d={`${d} L120 32 L0 32 Z`} fill="currentColor" />
        <path d={d} stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
      <div className="relative">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3',
            colors.chip
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <p className="font-display text-4xl font-semibold tracking-tight text-foreground tabular mb-1">
          {value}
        </p>
        <p className="text-sm font-medium text-foreground/80 mb-0.5">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}
