'use client'

import { AppSidebar } from '@/components/layout/AppSidebar'
import { adminNavGroups } from '@/lib/navigation'
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
      navGroups={adminNavGroups}
      roleLabel="Administrator"
    />
  )
}
