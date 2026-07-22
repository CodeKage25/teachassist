'use client'

import { AppSidebar } from '@/components/layout/AppSidebar'
import { adminNavItems } from '@/lib/navigation'
import type { UserProfile, School as SchoolType } from '@/types/database'

interface AdminSidebarProps {
  user: UserProfile
  school: SchoolType | null
}

export function AdminSidebar({ user, school }: AdminSidebarProps) {
  return (
    <AppSidebar
      user={user}
      school={school}
      navItems={adminNavItems}
      roleLabel="Administrator"
    />
  )
}
