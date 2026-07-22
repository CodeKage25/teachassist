'use client'

import { AppSidebar, type SidebarNavItem } from '@/components/layout/AppSidebar'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  Settings,
  MessageSquare,
} from 'lucide-react'
import type { UserProfile, School as SchoolType } from '@/types/database'

interface AdminSidebarProps {
  user: UserProfile
  school: SchoolType | null
}

const navItems: SidebarNavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Teachers', href: '/admin/teachers', icon: Users, exact: false },
  { label: 'Classrooms', href: '/admin/classrooms', icon: School, exact: false },
  { label: 'Students', href: '/admin/students', icon: GraduationCap, exact: false },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare, exact: false },
  { label: 'Settings', href: '/admin/settings', icon: Settings, exact: false },
]

export function AdminSidebar({ user, school }: AdminSidebarProps) {
  return (
    <AppSidebar
      user={user}
      school={school}
      navItems={navItems}
      roleLabel="Administrator"
    />
  )
}
