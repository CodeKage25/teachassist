import { MobileNav } from './MobileNav'
import { ThemeToggle } from './ThemeToggle'

interface TopbarProps {
  sidebar: React.ReactNode
}

export function Topbar({ sidebar }: TopbarProps) {
  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center h-14 px-4 bg-background/80 backdrop-blur-md border-b border-border">
      <MobileNav sidebar={sidebar} />
      <div className="flex-1" />
      <ThemeToggle className="text-muted-foreground" />
    </header>
  )
}
