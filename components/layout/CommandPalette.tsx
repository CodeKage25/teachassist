'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { adminNavItems, teacherNavItems } from '@/lib/navigation'
import { signOut } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'
import {
  Search,
  Moon,
  LogOut,
  CornerDownLeft,
  type LucideIcon,
} from 'lucide-react'

interface Command {
  label: string
  hint: string
  icon: LucideIcon
  run: () => void
}

/** Fires the palette open from anywhere (e.g. the sidebar search button). */
export const OPEN_COMMAND_PALETTE_EVENT = 'teachassist:open-command-palette'

export function CommandPalette({ role }: { role: 'admin' | 'teacher' }) {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const commands = useMemo<Command[]>(() => {
    const nav = role === 'admin' ? adminNavItems : teacherNavItems
    return [
      ...nav.map((item) => ({
        label: item.label,
        hint: 'Go to',
        icon: item.icon,
        run: () => router.push(item.href),
      })),
      {
        label: 'Toggle theme',
        hint: 'Appearance',
        icon: Moon,
        run: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
      },
      {
        label: 'Sign out',
        hint: 'Session',
        icon: LogOut,
        run: () => void signOut(),
      },
    ]
  }, [role, router, resolvedTheme, setTheme])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) => c.label.toLowerCase().includes(q))
  }, [commands, query])

  const openPalette = useCallback(() => {
    setQuery('')
    setActive(0)
    setOpen(true)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        openPalette()
      }
    }
    function onOpenEvent() {
      openPalette()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, onOpenEvent)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, onOpenEvent)
    }
  }, [openPalette])

  function runCommand(cmd: Command) {
    setOpen(false)
    cmd.run()
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter' && filtered[active]) {
      e.preventDefault()
      runCommand(filtered[active])
    }
  }

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [active])

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-[18%] z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-popover/95 backdrop-blur-xl shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">
            Command palette
          </DialogPrimitive.Title>

          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActive(0)
              }}
              onKeyDown={onInputKeyDown}
              placeholder="Search pages and actions…"
              className="h-13 w-full bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden sm:inline-flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-72 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                No results for “{query}”
              </p>
            ) : (
              filtered.map((cmd, i) => (
                <button
                  key={cmd.label}
                  data-active={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => runCommand(cmd)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                    i === active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground/80'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background',
                      i === active && 'border-primary/30 text-primary'
                    )}
                  >
                    <cmd.icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex-1 text-left font-medium">{cmd.label}</span>
                  <span className="text-xs text-muted-foreground">{cmd.hint}</span>
                  {i === active && (
                    <CornerDownLeft className="h-3 w-3 text-muted-foreground" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 border-t border-border bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>esc close</span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
