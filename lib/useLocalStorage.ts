'use client'

import { useCallback, useSyncExternalStore } from 'react'

// Snapshot cache so getSnapshot returns a stable reference per raw value,
// as required by useSyncExternalStore.
const cache = new Map<string, { raw: string | null; value: unknown }>()

function readSnapshot<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  const cached = cache.get(key)
  if (cached && cached.raw === raw) return cached.value as T
  let value: T
  try {
    value = raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    value = fallback
  }
  cache.set(key, { raw, value })
  return value
}

/**
 * localStorage-backed state that is SSR/hydration-safe: the server (and the
 * hydration pass) see `fallback`, then React re-renders with the stored value.
 * `fallback` must be referentially stable (module-level constant).
 */
export function useLocalStorageState<T>(key: string, fallback: T) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const handler = () => onChange()
      window.addEventListener('storage', handler)
      window.addEventListener(`local-storage:${key}`, handler)
      return () => {
        window.removeEventListener('storage', handler)
        window.removeEventListener(`local-storage:${key}`, handler)
      }
    },
    [key]
  )

  const value = useSyncExternalStore(
    subscribe,
    () => readSnapshot(key, fallback),
    () => fallback
  )

  const setValue = useCallback(
    (next: T) => {
      localStorage.setItem(key, JSON.stringify(next))
      window.dispatchEvent(new Event(`local-storage:${key}`))
    },
    [key]
  )

  return [value, setValue] as const
}
