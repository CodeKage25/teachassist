import { MobileNav } from './MobileNav'
import { ThemeToggle } from './ThemeToggle'
import { Logo } from '@/components/brand/Logo'

interface TopbarProps {
  sidebar: React.ReactNode
}

export function Topbar({ sidebar }: TopbarProps) {
  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center gap-2 h-14 px-4 bg-background/80 backdrop-blur-md border-b border-border">
      <MobileNav sidebar={sidebar} />
      <Logo markClassName="w-7 h-7" wordmarkClassName="text-base" />
      <div className="flex-1" />
      <ThemeToggle className="text-muted-foreground" />
    </header>
  )
}
