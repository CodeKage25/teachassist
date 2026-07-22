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
  blue: { chip: 'bg-primary/10 text-primary', glow: 'from-primary/8' },
  teal: { chip: 'bg-success/10 text-success', glow: 'from-success/8' },
  slate: { chip: 'bg-muted text-muted-foreground', glow: 'from-muted/60' },
  green: { chip: 'bg-success/10 text-success', glow: 'from-success/8' },
  amber: { chip: 'bg-warning/10 text-warning', glow: 'from-warning/8' },
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  color = 'blue',
}: MetricCardProps) {
  const colors = colorMap[color]

  return (
    <div className="group relative overflow-hidden bg-card rounded-2xl border border-border p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          colors.glow
        )}
      />
      <div className="relative">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110',
            colors.chip
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-3xl font-bold tracking-tight text-foreground tabular mb-1">
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
