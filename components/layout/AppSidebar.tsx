'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'
import { cn, getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { OPEN_COMMAND_PALETTE_EVENT } from '@/components/layout/CommandPalette'
import { LogOut, Search, PanelLeftClose, PanelLeftOpen, type LucideIcon } from 'lucide-react'
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

const COLLAPSE_KEY = 'ta-sidebar-collapsed'

export function AppSidebar({ user, school, navItems, roleLabel }: AppSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    queueMicrotask(() => {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1')
    })
  }, [])

  function toggleCollapsed() {
    setCollapsed((prev) => {
      localStorage.setItem(COLLAPSE_KEY, prev ? '0' : '1')
      return !prev
    })
  }

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  /* Collapse only applies at lg+; inside the mobile sheet the rail stays expanded. */
  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-[width] duration-300 ease-out',
        collapsed ? 'w-64 lg:w-[4.75rem]' : 'w-64'
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          'flex items-center gap-3 px-5 py-5 border-b border-sidebar-border',
          collapsed && 'lg:px-0 lg:justify-center'
        )}
      >
        <LogoMark className="w-9 h-9 shadow-sm shadow-primary/20 rounded-xl flex-shrink-0" />
        <div className={cn('min-w-0 flex-1', collapsed && 'lg:hidden')}>
          <p className="font-semibold text-sm truncate">{school?.name ?? 'TeachAssist'}</p>
          <p className="text-xs text-muted-foreground">{roleLabel}</p>
        </div>
      </div>

      {/* Collapse toggle (desktop only) */}
      <div className={cn('hidden lg:flex px-3 pt-3', collapsed && 'justify-center')}>
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground',
            collapsed ? 'justify-center w-11' : 'w-full'
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4 flex-shrink-0" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4 flex-shrink-0" />
              Collapse
            </>
          )}
        </button>
      </div>

      {/* Search */}
      <div className={cn('px-3 pt-3', collapsed && 'lg:flex lg:justify-center')}>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT))}
          title="Search (⌘K)"
          className={cn(
            'flex items-center gap-2.5 rounded-xl border border-border bg-muted/40 text-sm text-muted-foreground shadow-xs transition-all duration-200 hover:border-primary/30 hover:bg-muted/70 hover:text-foreground',
            collapsed
              ? 'w-full px-3 py-2 lg:w-11 lg:h-10 lg:justify-center lg:px-0'
              : 'w-full px-3 py-2'
          )}
        >
          <Search className="h-3.5 w-3.5 flex-shrink-0" />
          <span className={cn('flex-1 text-left', collapsed && 'lg:hidden')}>Search…</span>
          <kbd
            className={cn(
              'rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium',
              collapsed && 'lg:hidden'
            )}
          >
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
              title={item.label}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200',
                collapsed
                  ? 'px-3 py-2.5 lg:w-11 lg:h-11 lg:justify-center lg:px-0'
                  : 'px-3 py-2.5',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  'absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary transition-all duration-200',
                  active ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50',
                  collapsed && 'lg:-left-3'
                )}
              />
              <item.icon
                className={cn(
                  'h-4.5 w-4.5 flex-shrink-0 transition-transform duration-200',
                  active ? 'text-primary' : 'group-hover:scale-105'
                )}
              />
              <span className={cn(collapsed && 'lg:hidden')}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        <div
          className={cn(
            'flex items-center justify-between px-3',
            collapsed && 'lg:justify-center lg:px-0'
          )}
        >
          <span className={cn('text-xs font-medium text-muted-foreground', collapsed && 'lg:hidden')}>
            Appearance
          </span>
          <ThemeToggle className="h-8 w-8 text-muted-foreground hover:text-foreground" />
        </div>
        <div
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted transition-colors',
            collapsed && 'lg:flex-col lg:px-0 lg:gap-2'
          )}
        >
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {getInitials(user.full_name || roleLabel.charAt(0))}
            </AvatarFallback>
          </Avatar>
          <div className={cn('flex-1 min-w-0', collapsed && 'lg:hidden')}>
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
