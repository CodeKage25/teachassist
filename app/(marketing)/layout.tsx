import Link from 'next/link'
import { MarketingNav } from '@/components/layout/MarketingNav'
import { Logo } from '@/components/brand/Logo'

const footerLinks = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Pricing', href: '/#pricing' },
    ],
  },
  {
    heading: 'Get started',
    links: [
      { label: 'Create your school', href: '/signup' },
      { label: 'Sign in', href: '/login' },
      { label: 'Reset password', href: '/forgot-password' },
    ],
  },
]

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1">{children}</main>

      <footer className="relative border-t border-border/60 bg-muted/20 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 w-[50rem] h-64 rounded-full bg-primary/5 blur-3xl"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2 space-y-4">
              <Link href="/" className="inline-block">
                <Logo />
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                One calm, organised platform for running your school — classrooms,
                attendance, messaging and AI-powered insights.
              </p>
            </div>
            {footerLinks.map((col) => (
              <div key={col.heading}>
                <p className="text-sm font-semibold text-foreground mb-4">{col.heading}</p>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} TeachAssist. All rights reserved.</p>
            <p>Built for educators, by educators.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
