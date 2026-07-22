# UI Overhaul — State of the Art Pass (2026-07-22)

## Goal
Greatly improve the UI: modern design system, dark mode, polished components, verified working build.

## Findings
- Tailwind v4 + shadcn/ui tokens exist in `app/globals.css` but ~47 files bypass them with hardcoded `bg-white`, `slate-*`, `blue-700` classes.
- `next-themes` is installed and `sonner.tsx` expects it, but no `ThemeProvider` is mounted — dark mode was dead code.
- Components were functional but visually flat (no elevation system, no motion, inconsistent color usage).

## Plan
- [x] Write plan to tasks/todo.md
- [x] Upgrade design tokens & global styles in `app/globals.css`
- [x] Add `ThemeProvider` (next-themes) to root layout + `ThemeToggle` component
- [x] Migrate hardcoded colors → semantic tokens across app/ and components/ (47 files)
- [x] Polish shared components: MetricCard, PageHeader, EmptyState, sidebars (extracted shared AppSidebar), Topbar
- [x] Polish marketing landing page + auth layout
- [x] Verify: `next build` + `npm run lint` pass clean

## Review
- **Design system**: refreshed palette in `globals.css` — indigo primary (matches existing #4f46e5 PWA theme color), new `--success`/`--warning` status tokens, elevation shadow scale, `::selection`/focus-visible styling, `prefers-reduced-motion` support, and `animate-page-in` / `surface` / `tabular` utilities.
- **Dark mode**: `ThemeProvider` mounted in root layout (`attribute="class"`, system default). `ThemeToggle` (CSS-driven icon swap, no hydration state) added to sidebar footers and the mobile Topbar. Viewport `themeColor` is now light/dark aware.
- **Token migration**: scripted longest-match-first replacement of all hardcoded palette classes (white/slate/blue/teal/green/amber/red → card/muted/primary/success/warning/destructive tokens) across 47 tsx files, plus a context pass converting `text-white` to `*-foreground` on colored surfaces. Only intentional literals remain (photo overlay whites, dark brand panels, browser-chrome dots, star ratings).
- **Components**: AdminSidebar/TeacherSidebar deduplicated into `components/layout/AppSidebar.tsx` (active-route indicator bar, gradient brand mark, theme toggle). MetricCard got tinted icon chips + hover glow/lift. EmptyState got a dashed-border card with glow icon. Topbar is translucent with backdrop blur.
- **Marketing/auth**: hero has decorative gradient glows + gradient headline; feature cards animate on hover; PWA banner is a gradient card (fixed invisible chip artifact from migration); auth brand panel is slate-950 with indigo/violet glows.
- **Verification**: `next build` ✓ (all 25 routes), `npm run lint` ✓ 0 errors (2 pre-existing `<img>` warnings), prod-server smoke test ✓ (public routes 200, `/admin` `/teacher` correctly 307 → /login), no doubled-class migration artifacts.

## Round 2 — "Design is mid" feedback (same day)
User judged the first pass as not state-of-the-art. Second pass added visible design ambition:
- **globals.css**: `bg-grid` blueprint texture + bottom mask, `animate-float-slow` drifting orbs, `animate-pulse-dot` live badge, scroll-reveal classes (reduced-motion safe).
- **`components/marketing/Reveal.tsx`**: IntersectionObserver scroll-reveal wrapper with stagger delays.
- **Landing page rebuilt**: atmospheric hero (grid + animated orbs, gradient headline, glowing CTA), dashboard preview in gradient ring with under-glow, stats band with gradient numerals, bento-grid features (span-2 cards with mini roster/chat/chart visuals), gradient-connected steps, gradient PWA banner with glass phone mockup, testimonial cards with gradient-ring avatars, CTA with ambient glow.
- **Dashboards**: date line greeting on admin + teacher overviews, icon quick-action cards with slide arrows, gradient avatars, hover lift/scale micro-interactions on classroom cards.
- **Re-verified**: build ✓, lint 0 errors ✓, smoke test 200s ✓.
