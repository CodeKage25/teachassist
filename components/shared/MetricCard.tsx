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
  blue: { bg: 'bg-blue-700', icon: 'text-white' },
  teal: { bg: 'bg-teal-600', icon: 'text-white' },
  slate: { bg: 'bg-slate-700', icon: 'text-white' },
  green: { bg: 'bg-green-600', icon: 'text-white' },
  amber: { bg: 'bg-amber-500', icon: 'text-white' },
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
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-sm hover:border-slate-300 transition-all duration-200">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', colors.bg)}>
        <Icon className={cn('h-5 w-5', colors.icon)} />
      </div>
      <p className="text-3xl font-black tracking-tight text-slate-900 mb-1">{value}</p>
      <p className="text-sm font-medium text-slate-700 mb-0.5">{title}</p>
      {description && (
        <p className="text-xs text-slate-400">{description}</p>
      )}
    </div>
  )
}
