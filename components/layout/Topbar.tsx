import { MobileNav } from './MobileNav'
import { ThemeToggle } from './ThemeToggle'
import { TopbarTitle } from './TopbarTitle'

interface TopbarProps {
  sidebar: React.ReactNode
}

export function Topbar({ sidebar }: TopbarProps) {
  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center gap-2 h-14 px-4 bg-background/80 backdrop-blur-md border-b border-border">
      <MobileNav sidebar={sidebar} />
      <TopbarTitle />
      <div className="flex-1" />
      <ThemeToggle className="text-muted-foreground" />
    </header>
  )
}
