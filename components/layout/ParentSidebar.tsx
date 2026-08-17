'use client'

import { AppSidebar } from '@/components/layout/AppSidebar'
import { parentNavGroups } from '@/lib/navigation'
import type { UserProfile, School as SchoolType } from '@/types/database'

interface ParentSidebarProps {
  user: UserProfile
  school: SchoolType | null
}

export function ParentSidebar({ user, school }: ParentSidebarProps) {
  return (
    <AppSidebar
      user={user}
      school={school}
      navGroups={parentNavGroups}
      roleLabel="Parent"
    />
  )
}
