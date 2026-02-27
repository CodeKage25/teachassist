import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Users,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  MessageSquare,
  GraduationCap,
  Shield,
  ArrowRight,
  Star,
  CheckCircle,
  Zap,
  Calendar,
  TrendingUp,
} from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Teacher Management',
    description:
      'Invite teachers by email, assign classrooms, and manage access — all from one place.',
  },
  {
    icon: BookOpen,
    title: 'Classroom Management',
    description:
      'Create classrooms, enroll students, and assign teachers in a few straightforward steps.',
  },
  {
    icon: ClipboardCheck,
    title: 'Attendance Tracking',
    description:
      'Teachers record daily attendance from any device. Fast, accurate, and always accessible.',
  },
  {
    icon: MessageSquare,
    title: 'Staff Communication',
    description:
      'A built-in channel for teachers and administrators to share updates in real-time.',
  },
  {
    icon: BarChart3,
    title: 'School Overview',
    description:
      'Monitor teacher count, student enrollment, and classroom activity from your dashboard.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description:
      'Admins and teachers see only what they need. Secure and well-structured by design.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Create your school',
    description: 'Sign up and fill in your school details. Your dashboard is ready in under two minutes.',
  },
  {
    number: '02',
    title: 'Invite your teachers',
    description: 'Enter an email address — your teacher receives a login link immediately.',
  },
  {
    number: '03',
    title: 'Set up classrooms',
    description: 'Create classes, assign teachers, and enroll students in a few clicks.',
  },
  {
    number: '04',
    title: 'Run your school',
    description: 'Track attendance, send messages, and keep everything in order from one place.',
  },
]

const testimonials = [
  {
    quote: 'Our admin work dropped dramatically. Teachers spend more time teaching, less time on paperwork.',
    author: 'Sarah Johnson',
    role: 'Head Teacher, Greenwood Academy',
    initial: 'S',
  },
  {
    quote: 'Setup was quick and the role-based access means each person only sees what they need. Exactly right.',
    author: 'Michael Osei',
    role: 'Administrator, Sunrise School',
    initial: 'M',
  },
  {
    quote: 'Attendance is taken in seconds now. The messaging channel means no more chasing people.',
    author: 'Amina Diallo',
    role: 'Principal, Heritage International',
    initial: 'A',
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col">

      {/* ─── Hero ─── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-0 lg:pt-24">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full border border-blue-100">
              <Zap className="w-3.5 h-3.5" />
              Purpose-built for schools
            </div>
          </div>

          {/* Headline */}
          <div className="text-center max-w-4xl mx-auto mb-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.06]">
              Run your school
              <br />
              <span className="text-blue-700">with confidence.</span>
            </h1>
            <p className="mt-6 text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              TeachAssist gives school administrators and teachers one clean platform to manage
              classrooms, track attendance, and stay in sync.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Button
              size="lg"
              className="w-full sm:w-auto px-8 h-12 text-base font-semibold bg-blue-700 hover:bg-blue-800 text-white shadow-sm"
              asChild
            >
              <Link href="/signup">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto px-8 h-12 text-base font-semibold text-slate-700 border-slate-300 hover:bg-slate-50"
              asChild
            >
              <Link href="/login">Sign in to your school</Link>
            </Button>
          </div>

          {/* Trust line */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 pb-14">
            {['Free to start', 'No credit card required', 'Works on mobile', 'PWA — works offline'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-teal-500 flex-shrink-0" />
                {item}
              </span>
            ))}
          </div>

          {/* ─── Dashboard Preview ─── */}
          <div className="rounded-t-2xl border border-b-0 border-slate-200 shadow-2xl shadow-slate-100 overflow-hidden">
            {/* Browser bar */}
            <div className="bg-slate-100 px-4 py-3 flex items-center gap-3 border-b border-slate-200">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-300 block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 block" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-300 block" />
              </div>
              <div className="flex-1 flex justify-center">
                <span className="bg-white rounded border border-slate-200 px-4 py-1 text-xs text-slate-400 font-mono">
                  app.teachassist.school/admin
                </span>
              </div>
            </div>

            {/* App shell */}
            <div className="flex bg-slate-50" style={{ minHeight: 380 }}>
              {/* Sidebar */}
              <div className="hidden sm:flex flex-col w-52 bg-white border-r border-slate-200 p-4 gap-1 flex-shrink-0">
                <div className="flex items-center gap-2 px-2 py-2 mb-2">
                  <div className="w-6 h-6 bg-blue-700 rounded-md flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 truncate">Greenfield High</span>
                </div>
                {[
                  { label: 'Overview', active: true },
                  { label: 'Teachers', active: false },
                  { label: 'Classrooms', active: false },
                  { label: 'Students', active: false },
                  { label: 'Messages', active: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`px-3 py-2 rounded-lg text-xs font-medium ${
                      item.active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-5 overflow-hidden">
                {/* Greeting */}
                <div className="mb-5">
                  <p className="text-xs text-slate-400">Thursday, 27 Feb 2025</p>
                  <p className="text-base font-bold text-slate-800">Welcome back, Mr. Adeyemi 👋</p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'Teachers', value: '24', icon: Users, color: 'blue' },
                    { label: 'Students', value: '487', icon: GraduationCap, color: 'teal' },
                    { label: 'Classrooms', value: '18', icon: BookOpen, color: 'slate' },
                    { label: 'Messages', value: '12', icon: MessageSquare, color: 'blue' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl p-3 border border-slate-200">
                      <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
                      <p className="text-xl font-black text-slate-800">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Table preview */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Recent Classrooms</span>
                    <span className="text-xs text-blue-600">View all</span>
                  </div>
                  {[
                    { name: 'JSS 1A', teacher: 'Mr. Ade Okafor', students: 32, status: 'Active' },
                    { name: 'JSS 2B', teacher: 'Mrs. Fatima Bello', students: 28, status: 'Active' },
                    { name: 'SSS 1C', teacher: 'Mr. Chidi Nweze', students: 35, status: 'Active' },
                  ].map((row) => (
                    <div key={row.name} className="px-4 py-2.5 flex items-center gap-3 border-b border-slate-50 last:border-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700">{row.name}</p>
                        <p className="text-xs text-slate-400 truncate">{row.teacher}</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
                        <Users className="w-3 h-3" />
                        {row.students}
                      </div>
                      <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-medium">
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Social proof strip ─── */}
      <section className="bg-slate-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-10 text-center">
            {[
              { value: '500+', label: 'Schools' },
              { value: '10,000+', label: 'Teachers' },
              { value: '200,000+', label: 'Students' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-sm text-slate-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-blue-700 text-sm font-bold uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
              Everything a school needs. Nothing it doesn&apos;t.
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Purpose-built tools for administrators and teachers — no bloat, no unnecessary complexity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all duration-200 bg-white"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-blue-700 text-sm font-bold uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
              From sign-up to running in minutes.
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              No technical knowledge required. If you can send an email, you can set up TeachAssist.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-full w-full h-px bg-slate-300 -translate-x-4" />
                )}
                <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white text-sm font-black mb-4">
                  {step.number}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Mobile / PWA ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-700 rounded-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-0">
              {/* Text side */}
              <div className="flex-1 p-8 md:p-12 text-white space-y-4">
                <div className="inline-flex items-center gap-2 bg-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                  <TrendingUp className="h-3 w-3" />
                  Mobile · PWA · Offline
                </div>
                <h2 className="text-2xl sm:text-3xl font-black leading-tight">
                  Works on any device.
                  <br />
                  Even without internet.
                </h2>
                <p className="text-blue-100 leading-relaxed max-w-md text-sm">
                  Install TeachAssist on any phone or tablet as a Progressive Web App.
                  Teachers can take attendance offline — it syncs automatically when back online.
                </p>
                <Button
                  size="default"
                  className="bg-white text-blue-700 hover:bg-blue-50 font-semibold mt-2"
                  asChild
                >
                  <Link href="/signup">
                    Try it free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Visual side */}
              <div className="hidden md:flex flex-shrink-0 w-72 items-end justify-center bg-blue-800 self-stretch px-8 pt-8">
                <div className="w-full bg-white rounded-t-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-blue-700 rounded-md flex items-center justify-center">
                      <BookOpen className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">Attendance</span>
                    <span className="ml-auto text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Feb 27
                    </span>
                  </div>
                  {[
                    { name: 'Amaka Eze', status: 'Present', color: 'teal' },
                    { name: 'Biodun Adeko', status: 'Absent', color: 'red' },
                    { name: 'Chisom Obi', status: 'Present', color: 'teal' },
                    { name: 'David Lawal', status: 'Late', color: 'amber' },
                  ].map((s) => (
                    <div key={s.name} className="flex items-center gap-2 py-1.5 border-b border-slate-100 last:border-0">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex-shrink-0" />
                      <span className="text-xs text-slate-700 flex-1 font-medium">{s.name}</span>
                      <span className={`text-xs font-semibold ${
                        s.color === 'teal' ? 'text-teal-600' :
                        s.color === 'red' ? 'text-red-500' : 'text-amber-600'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                  ))}
                  <div className="mt-3 bg-blue-700 rounded-lg py-2 text-center text-xs text-white font-semibold">
                    Save Attendance
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 lg:py-32 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-0.5 text-amber-400 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
              <span className="ml-3 text-slate-500 text-sm">4.9 from 500+ schools</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Used by educators everywhere
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.author} className="bg-white rounded-2xl p-6 border border-slate-200">
                <div className="flex gap-0.5 text-amber-400 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <blockquote className="text-slate-600 text-sm leading-relaxed mb-5">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t.author}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section id="pricing" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-4">
            Ready to get organised?
          </h2>
          <p className="text-slate-500 text-lg mb-10 leading-relaxed">
            Create your school, invite your team, and start managing — free, no credit card required.
          </p>
          <Button
            size="lg"
            className="px-10 h-12 text-base font-semibold bg-blue-700 hover:bg-blue-800 text-white"
            asChild
          >
            <Link href="/signup">
              Create your school — it&apos;s free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
