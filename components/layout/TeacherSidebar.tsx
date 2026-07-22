'use client'

import { AppSidebar, type SidebarNavItem } from '@/components/layout/AppSidebar'
import {
  LayoutDashboard,
  School,
  MessageSquare,
  GraduationCap,
  Sparkles,
  ClipboardCheck,
  CalendarDays,
  Gamepad2,
} from 'lucide-react'
import type { UserProfile, School as SchoolType } from '@/types/database'

interface TeacherSidebarProps {
  user: UserProfile
  school: SchoolType | null
}

const navItems: SidebarNavItem[] = [
  { label: 'Overview', href: '/teacher', icon: LayoutDashboard, exact: true },
  { label: 'My Classrooms', href: '/teacher/classrooms', icon: School, exact: false },
  { label: 'My Students', href: '/teacher/students', icon: GraduationCap, exact: false },
  { label: 'Attendance', href: '/teacher/attendance', icon: ClipboardCheck, exact: false },
  { label: 'Lesson Plans', href: '/teacher/lesson-plan', icon: Sparkles, exact: false },
  { label: 'Calendar', href: '/teacher/calendar', icon: CalendarDays, exact: false },
  { label: 'Quiz Games', href: '/teacher/games', icon: Gamepad2, exact: false },
  { label: 'Messages', href: '/teacher/messages', icon: MessageSquare, exact: false },
]

export function TeacherSidebar({ user, school }: TeacherSidebarProps) {
  return (
    <AppSidebar
      user={user}
      school={school}
      navItems={navItems}
      roleLabel="Teacher"
    />
  )
}
