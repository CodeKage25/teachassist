import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'

export const metadata: Metadata = {
  title: {
    default: 'Sign In',
    template: '%s | TeachAssist',
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left panel — brand */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-slate-950 text-white flex-col justify-between p-12 overflow-hidden">
        {/* Decorative glows */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] rounded-full bg-indigo-600/25 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full bg-violet-600/15 blur-3xl" />
        </div>

        <div className="relative">
          <Link href="/" className="inline-block">
            <Logo onDark markClassName="w-9 h-9 shadow-lg shadow-indigo-500/30 rounded-xl" wordmarkClassName="text-xl" />
          </Link>
        </div>

        <div className="relative space-y-8">
          <blockquote className="space-y-4">
            <p className="text-3xl font-black leading-snug text-white">
              The smarter way to
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                run your school.
              </span>
            </p>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              Manage teachers, classrooms, students and attendance — from one organised dashboard.
            </p>
          </blockquote>

          <div className="flex gap-8 pt-2 border-t border-white/10">
            {[
              { value: '500+', label: 'Schools' },
              { value: '10k+', label: 'Teachers' },
              { value: '200k+', label: 'Students' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white tabular">{stat.value}</p>
                <p className="text-slate-500 text-sm mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-slate-500 text-sm">
          © {new Date().getFullYear()} TeachAssist. All rights reserved.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-center pt-8 pb-6">
          <Link href="/" className="inline-block">
            <Logo markClassName="w-9 h-9" wordmarkClassName="text-xl" />
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:py-12">
          <div className="w-full max-w-md animate-page-in">{children}</div>
        </div>
      </div>
    </div>
  )
}
