import { useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * TeachAssist brand mark — "the open book in flight".
 * Two upswept pages form wings (teaching, growth); a four-point spark
 * rises from the spine (the AI assist). Pure geometry, no icon fonts.
 */

const GLYPH_PATHS = {
  leftPage: 'M9 18C14.6 15.4 20.3 16.6 23 19.6V39C20.3 36.2 14.6 35.2 9 37.4Z',
  rightPage: 'M39 18C33.4 15.4 27.7 16.6 25 19.6V39C27.7 36.2 33.4 35.2 39 37.4Z',
  spark: 'M24 6L25.5 9.5 29 11 25.5 12.5 24 16 22.5 12.5 19 11 22.5 9.5Z',
}

/** Glyph only — inherits currentColor. For placing on solid/gradient surfaces. */
export function LogoGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d={GLYPH_PATHS.leftPage} />
      <path d={GLYPH_PATHS.rightPage} />
      <path d={GLYPH_PATHS.spark} />
      <circle cx="31.5" cy="6.5" r="1.5" />
    </svg>
  )
}

/** Full mark — gradient tile with the white glyph. Scales via className (w-8 h-8 etc). */
export function LogoMark({ className }: { className?: string }) {
  const id = useId()
  const tileId = `${id}-tile`
  const sheenId = `${id}-sheen`
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={cn('shrink-0', className)}>
      <defs>
        <linearGradient id={tileId} x1="4" y1="2" x2="46" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366F1" />
          <stop offset="0.55" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#9333EA" />
        </linearGradient>
        <radialGradient id={sheenId} cx="0.28" cy="0.12" r="0.9">
          <stop offset="0" stopColor="#fff" stopOpacity="0.32" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill={`url(#${tileId})`} />
      <rect width="48" height="48" rx="13" fill={`url(#${sheenId})`} />
      <g fill="#fff">
        <path d={GLYPH_PATHS.leftPage} />
        <path d={GLYPH_PATHS.rightPage} />
        <path d={GLYPH_PATHS.spark} />
        <circle cx="31.5" cy="6.5" r="1.5" />
      </g>
    </svg>
  )
}

interface LogoProps {
  className?: string
  markClassName?: string
  wordmarkClassName?: string
  /** Force light wordmark for dark surfaces (auth panel). */
  onDark?: boolean
}

/** Mark + wordmark lockup. */
export function Logo({ className, markClassName, wordmarkClassName, onDark }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className={cn('w-8 h-8', markClassName)} />
      <span
        className={cn(
          'text-lg font-bold tracking-tight leading-none',
          onDark ? 'text-white' : 'text-foreground',
          wordmarkClassName
        )}
      >
        Teach
        <span
          className={
            onDark
              ? 'bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent'
          }
        >
          Assist
        </span>
      </span>
    </span>
  )
}
