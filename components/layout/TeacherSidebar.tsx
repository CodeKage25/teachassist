'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'
import { cn, getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  LayoutDashboard,
  School,
  LogOut,
  MessageSquare,
} from 'lucide-react'
import type { UserProfile, School as SchoolType } from '@/types/database'

interface TeacherSidebarProps {
  user: UserProfile
  school: SchoolType | null
}

const navItems = [
  { label: 'My Classes', href: '/teacher', icon: LayoutDashboard, exact: true },
  { label: 'Classrooms', href: '/teacher/classrooms', icon: School, exact: false },
  { label: 'Messages', href: '/teacher/messages', icon: MessageSquare, exact: false },
]

export function TeacherSidebar({ user, school }: TeacherSidebarProps) {
  const pathname = usePathname()

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="flex flex-col h-full w-64 bg-white border-r border-border">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border">
        <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm truncate">{school?.name ?? 'TeachAssist'}</p>
          <p className="text-xs text-muted-foreground">Teacher</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-4 w-4 flex-shrink-0', active ? 'text-blue-700' : '')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted transition-colors">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
              {getInitials(user.full_name || 'T')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.full_name}</p>
            <p className="text-xs text-muted-foreground">Teacher</p>
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
