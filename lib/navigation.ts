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

export const adminNavItems: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Teachers', href: '/admin/teachers', icon: Users, exact: false },
  { label: 'Classrooms', href: '/admin/classrooms', icon: School, exact: false },
  { label: 'Students', href: '/admin/students', icon: GraduationCap, exact: false },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare, exact: false },
  { label: 'Settings', href: '/admin/settings', icon: Settings, exact: false },
]

export const teacherNavItems: NavItem[] = [
  { label: 'Overview', href: '/teacher', icon: LayoutDashboard, exact: true },
  { label: 'My Classrooms', href: '/teacher/classrooms', icon: School, exact: false },
  { label: 'My Students', href: '/teacher/students', icon: GraduationCap, exact: false },
  { label: 'Attendance', href: '/teacher/attendance', icon: ClipboardCheck, exact: false },
  { label: 'Lesson Plans', href: '/teacher/lesson-plan', icon: Sparkles, exact: false },
  { label: 'Calendar', href: '/teacher/calendar', icon: CalendarDays, exact: false },
  { label: 'Quiz Games', href: '/teacher/games', icon: Gamepad2, exact: false },
  { label: 'Messages', href: '/teacher/messages', icon: MessageSquare, exact: false },
]
