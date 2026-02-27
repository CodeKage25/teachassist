import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-between p-12">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-700 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">TeachAssist</span>
          </Link>
        </div>

        <div className="space-y-8">
          <blockquote className="space-y-4">
            <p className="text-3xl font-black leading-snug text-white">
              The smarter way to
              <br />
              <span className="text-blue-400">run your school.</span>
            </p>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              Manage teachers, classrooms, students and attendance — from one organised dashboard.
            </p>
          </blockquote>

          <div className="flex gap-8 pt-2 border-t border-slate-800">
            {[
              { value: '500+', label: 'Schools' },
              { value: '10k+', label: 'Teachers' },
              { value: '200k+', label: 'Students' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-slate-500 text-sm mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-slate-600 text-sm">
          © {new Date().getFullYear()} TeachAssist. All rights reserved.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-center pt-8 pb-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-700 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              TeachAssist
            </span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  )
}
