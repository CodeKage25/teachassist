import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  Settings,
  MessageSquare,
  Sparkles,
  ClipboardCheck,
  CalendarDays,
  Gamepad2,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  exact: boolean
}

export interface NavGroup {
  label: string | null
  items: NavItem[]
}

export const adminNavGroups: NavGroup[] = [
  {
    label: null,
    items: [
      { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Teachers', href: '/admin/teachers', icon: Users, exact: false },
      { label: 'Classrooms', href: '/admin/classrooms', icon: School, exact: false },
      { label: 'Students', href: '/admin/students', icon: GraduationCap, exact: false },
    ],
  },
  {
    label: 'Communication',
    items: [
      { label: 'Messages', href: '/admin/messages', icon: MessageSquare, exact: false },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings', href: '/admin/settings', icon: Settings, exact: false },
    ],
  },
]

export const teacherNavGroups: NavGroup[] = [
  {
    label: null,
    items: [
      { label: 'Overview', href: '/teacher', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Teaching',
    items: [
      { label: 'My Classrooms', href: '/teacher/classrooms', icon: School, exact: false },
      { label: 'My Students', href: '/teacher/students', icon: GraduationCap, exact: false },
      { label: 'Attendance', href: '/teacher/attendance', icon: ClipboardCheck, exact: false },
    ],
  },
  {
    label: 'AI Tools',
    items: [
      { label: 'Lesson Plans', href: '/teacher/lesson-plan', icon: Sparkles, exact: false },
      { label: 'Quiz Games', href: '/teacher/games', icon: Gamepad2, exact: false },
    ],
  },
  {
    label: 'Organize',
    items: [
      { label: 'Calendar', href: '/teacher/calendar', icon: CalendarDays, exact: false },
      { label: 'Messages', href: '/teacher/messages', icon: MessageSquare, exact: false },
    ],
  },
]

function flatten(groups: NavGroup[]): NavItem[] {
  return groups.flatMap((g) => g.items)
}

/** Flat lists, used by the command palette and mobile topbar title. */
export const adminNavItems: NavItem[] = flatten(adminNavGroups)
export const teacherNavItems: NavItem[] = flatten(teacherNavGroups)

/** Resolve the current page's nav label from a pathname (longest match wins). */
export function titleForPathname(pathname: string): string | null {
  const all = [...adminNavItems, ...teacherNavItems]
  let best: NavItem | null = null
  for (const item of all) {
    const matches = item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + '/')
    if (matches && (!best || item.href.length > best.href.length)) best = item
  }
  return best?.label ?? null
}
