'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'
import { cn, getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { OPEN_COMMAND_PALETTE_EVENT } from '@/components/layout/CommandPalette'
import { LogOut, Search, type LucideIcon } from 'lucide-react'
import { LogoMark } from '@/components/brand/Logo'
import type { UserProfile, School as SchoolType } from '@/types/database'

export interface SidebarNavItem {
  label: string
  href: string
  icon: LucideIcon
  exact: boolean
}

interface AppSidebarProps {
  user: UserProfile
  school: SchoolType | null
  navItems: SidebarNavItem[]
  roleLabel: string
}

export function AppSidebar({ user, school, navItems, roleLabel }: AppSidebarProps) {
  const pathname = usePathname()

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="flex flex-col h-full w-64 bg-sidebar border-r border-sidebar-border">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <LogoMark className="w-9 h-9 shadow-sm shadow-primary/20 rounded-xl" />
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{school?.name ?? 'TeachAssist'}</p>
          <p className="text-xs text-muted-foreground">{roleLabel}</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pt-4">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT))}
          className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground shadow-xs transition-all duration-200 hover:border-primary/30 hover:bg-muted/70 hover:text-foreground"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  'absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary transition-all duration-200',
                  active ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50'
                )}
              />
              <item.icon
                className={cn(
                  'h-4.5 w-4.5 flex-shrink-0 transition-transform duration-200',
                  active ? 'text-primary' : 'group-hover:scale-105'
                )}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        <div className="flex items-center justify-between px-3">
          <span className="text-xs font-medium text-muted-foreground">Appearance</span>
          <ThemeToggle className="h-8 w-8 text-muted-foreground hover:text-foreground" />
        </div>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted transition-colors">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {getInitials(user.full_name || roleLabel.charAt(0))}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.full_name}</p>
            <p className="text-xs text-muted-foreground">{roleLabel}</p>
          </div>
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </aside>
  )
}
