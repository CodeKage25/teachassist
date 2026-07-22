import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl" />
        <div className="relative w-14 h-14 bg-card border border-border rounded-2xl shadow-xs flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">{description}</p>
      {action}
    </div>
  )
}
