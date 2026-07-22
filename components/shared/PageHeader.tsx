interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="min-w-0">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
