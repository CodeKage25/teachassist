'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import type { UserProfile, School as SchoolType } from '@/types/database'

interface MobileNavProps {
  sidebar: React.ReactNode
}

export function MobileNav({ sidebar }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <div onClick={() => setOpen(false)} className="h-full">
          {sidebar}
        </div>
      </SheetContent>
    </Sheet>
  )
}
