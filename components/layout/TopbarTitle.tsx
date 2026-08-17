'use client'

import { usePathname } from 'next/navigation'
import { titleForPathname } from '@/lib/navigation'

export function TopbarTitle() {
  const pathname = usePathname()
  const title = titleForPathname(pathname)
  if (!title) return null
  return <span className="text-sm font-semibold truncate">{title}</span>
}
