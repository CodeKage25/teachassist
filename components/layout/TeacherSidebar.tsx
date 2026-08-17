'use client'

import { AppSidebar } from '@/components/layout/AppSidebar'
import { teacherNavGroups } from '@/lib/navigation'
import type { UserProfile, School as SchoolType } from '@/types/database'

interface TeacherSidebarProps {
  user: UserProfile
  school: SchoolType | null
}

export function TeacherSidebar({ user, school }: TeacherSidebarProps) {
  return (
    <AppSidebar
      user={user}
      school={school}
      navGroups={teacherNavGroups}
      roleLabel="Teacher"
    />
  )
}
