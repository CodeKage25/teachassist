import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/marketing/Reveal'
import { LogoMark } from '@/components/brand/Logo'
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
  Calendar,
  TrendingUp,
} from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Teacher Management',
    description:
      'Invite teachers by email, assign classrooms, and manage access — all from one place.',
    span: 'lg:col-span-2',
    visual: 'roster',
  },
  {
    icon: BookOpen,
    title: 'Classroom Management',
    description:
      'Create classrooms, enroll students, and assign teachers in a few straightforward steps.',
    span: '',
    visual: null,
  },
  {
    icon: ClipboardCheck,
    title: 'Attendance Tracking',
    description:
      'Teachers record daily attendance from any device. Fast, accurate, and always accessible.',
    span: '',
    visual: null,
  },
  {
    icon: MessageSquare,
    title: 'Staff Communication',
    description:
      'A built-in channel for teachers and administrators to share updates in real-time.',
    span: 'lg:col-span-2',
    visual: 'chat',
  },
  {
    icon: BarChart3,
    title: 'School Overview',
    description:
      'Monitor teacher count, student enrollment, and classroom activity from your dashboard.',
    span: 'lg:col-span-2',
    visual: 'chart',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description:
      'Admins and teachers see only what they need. Secure and well-structured by design.',
    span: '',
    visual: null,
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

function FeatureVisual({ kind }: { kind: string | null }) {
  if (kind === 'roster') {
    return (
      <div className="mt-6 space-y-2" aria-hidden>
        {[
          { name: 'Ade Okafor', cls: 'JSS 1A · Mathematics', on: true },
          { name: 'Fatima Bello', cls: 'JSS 2B · English', on: true },
          { name: 'Chidi Nweze', cls: 'SSS 1C · Physics', on: false },
        ].map((t) => (
          <div
            key={t.name}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-2"
          >
            <div className="w-6 h-6 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center">
              {t.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{t.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{t.cls}</p>
            </div>
            <span
              className={
                t.on
                  ? 'text-[10px] font-semibold text-success bg-success/10 border border-success/25 rounded-full px-2 py-0.5'
                  : 'text-[10px] font-semibold text-muted-foreground bg-muted rounded-full px-2 py-0.5'
              }
            >
              {t.on ? 'Active' : 'Invited'}
            </span>
          </div>
        ))}
      </div>
    )
  }
  if (kind === 'chat') {
    return (
      <div className="mt-6 space-y-2" aria-hidden>
        <div className="max-w-[75%] rounded-2xl rounded-bl-md border border-border/60 bg-background/60 px-3 py-2">
          <p className="text-[10px] font-semibold text-primary mb-0.5">Mrs. Bello</p>
          <p className="text-xs text-foreground/80">Staff meeting moved to 2pm today.</p>
        </div>
        <div className="ml-auto max-w-[75%] rounded-2xl rounded-br-md bg-primary px-3 py-2">
          <p className="text-xs text-primary-foreground">Noted — I&apos;ll update the notice board.</p>
        </div>
      </div>
    )
  }
  if (kind === 'chart') {
    return (
      <div className="mt-6 flex items-end gap-2 h-20" aria-hidden>
        {[42, 68, 55, 80, 64, 92, 74].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md bg-gradient-to-t from-primary/25 to-primary/70"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    )
  }
  return null
}

export default function LandingPage() {
  return (
    <div className="flex flex-col">

      {/* ─── Hero ─── */}
      <section className="relative bg-background overflow-hidden">
        {/* Atmosphere: blueprint grid + drifting orbs */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-grid mask-fade-b" />
          <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[70rem] h-[38rem] rounded-full bg-primary/10 blur-3xl animate-float-slow" />
          <div className="absolute top-24 right-[8%] w-80 h-80 rounded-full bg-chart-4/10 blur-3xl animate-float-slow [animation-delay:-7s]" />
          <div className="absolute inset-0 bg-noise opacity-[0.04] dark:opacity-[0.06]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-0 lg:pt-28">
          {/* Badge */}
          <Reveal className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2.5 bg-card/70 backdrop-blur text-sm font-medium px-4 py-1.5 rounded-full border border-border shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse-dot inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span className="text-muted-foreground">
                Purpose-built for schools —{' '}
                <span className="text-foreground font-semibold">free to start</span>
              </span>
            </div>
          </Reveal>

          {/* Headline */}
          <div className="text-center max-w-4xl mx-auto mb-10">
            <Reveal delay={80}>
              <h1 className="text-5xl sm:text-6xl lg:text-[5.25rem] font-black tracking-[-0.03em] text-foreground leading-[1.02] text-balance">
                Run your school
                <br />
                <span className="bg-gradient-to-r from-primary via-chart-4 to-primary bg-clip-text text-transparent animate-gradient-x">
                  with confidence.
                </span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-7 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
                TeachAssist gives school administrators and teachers one clean platform to manage
                classrooms, track attendance, and stay in sync.
              </p>
            </Reveal>
          </div>

          {/* CTA */}
          <Reveal delay={240} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Button
              size="lg"
              className="w-full sm:w-auto px-8 h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
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
              className="w-full sm:w-auto px-8 h-12 text-base font-semibold bg-card/60 backdrop-blur border-border hover:bg-muted/50 hover:-translate-y-0.5 transition-all duration-300"
              asChild
            >
              <Link href="/login">Sign in to your school</Link>
            </Button>
          </Reveal>

          {/* Trust line */}
          <Reveal delay={320} className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground pb-16">
            {['Free to start', 'No credit card required', 'Works on mobile', 'PWA — works offline'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-success flex-shrink-0" />
                {item}
              </span>
            ))}
          </Reveal>

          {/* ─── Dashboard Preview ─── */}
          <Reveal delay={200}>
            <div className="relative">
              {/* Glow under the frame */}
              <div
                aria-hidden
                className="absolute -inset-x-8 top-8 bottom-0 bg-gradient-to-r from-primary/20 via-chart-4/20 to-primary/20 blur-2xl"
              />
              <div className="relative rounded-t-3xl p-[1px] bg-gradient-to-b from-border via-primary/25 to-transparent transition-transform duration-700 ease-out [transform:perspective(1400px)_rotateX(3deg)] hover:[transform:perspective(1400px)_rotateX(0deg)]">
                <div className="rounded-t-[calc(1.5rem-1px)] overflow-hidden bg-card shadow-2xl shadow-primary/10">
                  {/* Browser bar */}
                  <div className="bg-muted/70 backdrop-blur px-4 py-3 flex items-center gap-3 border-b border-border">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-300 block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-300 block" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <span className="bg-card rounded-md border border-border px-4 py-1 text-xs text-muted-foreground font-mono">
                        app.teachassist.school/admin
                      </span>
                    </div>
                  </div>

                  {/* App shell */}
                  <div className="flex bg-muted/40" style={{ minHeight: 380 }}>
                    {/* Sidebar */}
                    <div className="hidden sm:flex flex-col w-52 bg-card border-r border-border p-4 gap-1 flex-shrink-0">
                      <div className="flex items-center gap-2 px-2 py-2 mb-2">
                        <LogoMark className="w-6 h-6 rounded-md" />
                        <span className="text-xs font-bold text-foreground/80 truncate">Greenfield High</span>
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
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground'
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
                        <p className="text-xs text-muted-foreground">Thursday, 27 Feb 2025</p>
                        <p className="text-base font-bold text-foreground">Welcome back, Mr. Adeyemi 👋</p>
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                        {[
                          { label: 'Teachers', value: '24' },
                          { label: 'Students', value: '487' },
                          { label: 'Classrooms', value: '18' },
                          { label: 'Messages', value: '12' },
                        ].map((stat) => (
                          <div key={stat.label} className="bg-card rounded-xl p-3 border border-border shadow-xs">
                            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                            <p className="text-xl font-black text-foreground tabular">{stat.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Table preview */}
                      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
                        <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground/80">Recent Classrooms</span>
                          <span className="text-xs text-primary">View all</span>
                        </div>
                        {[
                          { name: 'JSS 1A', teacher: 'Mr. Ade Okafor', students: 32, status: 'Active' },
                          { name: 'JSS 2B', teacher: 'Mrs. Fatima Bello', students: 28, status: 'Active' },
                          { name: 'SSS 1C', teacher: 'Mr. Chidi Nweze', students: 35, status: 'Active' },
                        ].map((row) => (
                          <div key={row.name} className="px-4 py-2.5 flex items-center gap-3 border-b border-border/40 last:border-0">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-3 h-3 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground/80">{row.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{row.teacher}</p>
                            </div>
                            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="w-3 h-3" />
                              {row.students}
                            </div>
                            <span className="text-xs bg-success/10 text-success border border-success/25 px-2 py-0.5 rounded-full font-medium">
                              {row.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Stats band ─── */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Reveal className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Schools' },
              { value: '10,000+', label: 'Teachers' },
              { value: '200,000+', label: 'Students' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl sm:text-4xl font-black tracking-tight tabular bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ─── Features (bento) ─── */}
      <section id="features" className="py-24 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-4 text-balance">
              Everything a school needs. Nothing it doesn&apos;t.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Purpose-built tools for administrators and teachers — no bloat, no unnecessary complexity.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={(i % 3) * 90} className={feature.span}>
                <div className="group relative h-full p-7 rounded-3xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-24 -right-24 w-56 h-56 rounded-full bg-primary/6 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 group-hover:rotate-3">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                    <FeatureVisual kind={feature.visual} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-4 text-balance">
              From sign-up to running in minutes.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              No technical knowledge required. If you can send an email, you can set up TeachAssist.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <Reveal key={step.number} delay={i * 110} className="relative">
                {i < steps.length - 1 && (
                  <div
                    aria-hidden
                    className="hidden lg:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-primary/40 to-transparent -translate-x-6"
                  />
                )}
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-chart-4 flex items-center justify-center text-primary-foreground text-sm font-black mb-5 shadow-lg shadow-primary/25">
                  {step.number}
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Mobile / PWA ─── */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative bg-gradient-to-br from-primary via-primary to-chart-4 rounded-3xl overflow-hidden shadow-2xl shadow-primary/25">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl"
              />
              <div className="relative flex flex-col md:flex-row items-center gap-0">
                {/* Text side */}
                <div className="flex-1 p-8 md:p-14 text-primary-foreground space-y-5">
                  <div className="inline-flex items-center gap-2 bg-primary-foreground/15 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">
                    <TrendingUp className="h-3 w-3" />
                    Mobile · PWA · Offline
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-balance">
                    Works on any device.
                    <br />
                    Even without internet.
                  </h2>
                  <p className="text-primary-foreground/80 leading-relaxed max-w-md">
                    Install TeachAssist on any phone or tablet as a Progressive Web App.
                    Teachers can take attendance offline — it syncs automatically when back online.
                  </p>
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 font-semibold mt-2 shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    asChild
                  >
                    <Link href="/signup">
                      Try it free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                {/* Visual side */}
                <div className="hidden md:flex flex-shrink-0 w-80 items-end justify-center bg-black/10 self-stretch px-8 pt-10">
                  <div className="w-full bg-card text-card-foreground rounded-t-3xl p-4 shadow-2xl border border-white/20 border-b-0">
                    <div className="flex items-center gap-2 mb-4">
                      <LogoMark className="w-6 h-6 rounded-md" />
                      <span className="text-xs font-bold text-foreground/80">Attendance</span>
                      <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Feb 27
                      </span>
                    </div>
                    {[
                      { name: 'Amaka Eze', status: 'Present', tone: 'text-success' },
                      { name: 'Biodun Adeko', status: 'Absent', tone: 'text-destructive' },
                      { name: 'Chisom Obi', status: 'Present', tone: 'text-success' },
                      { name: 'David Lawal', status: 'Late', tone: 'text-warning' },
                    ].map((s) => (
                      <div key={s.name} className="flex items-center gap-2 py-2 border-b border-border/60 last:border-0">
                        <div className="w-5 h-5 rounded-full bg-muted flex-shrink-0" />
                        <span className="text-xs text-foreground/80 flex-1 font-medium">{s.name}</span>
                        <span className={`text-xs font-semibold ${s.tone}`}>{s.status}</span>
                      </div>
                    ))}
                    <div className="mt-3 bg-primary rounded-lg py-2 text-center text-xs text-primary-foreground font-semibold shadow-sm shadow-primary/25">
                      Save Attendance
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 lg:py-32 bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-14">
            <div className="flex items-center justify-center gap-0.5 text-amber-400 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
              <span className="ml-3 text-muted-foreground text-sm">4.9 from 500+ schools</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground text-balance">
              Used by educators everywhere
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <Reveal key={t.author} delay={i * 100}>
                <figure className="h-full bg-card rounded-3xl p-7 border border-border shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="flex gap-0.5 text-amber-400 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-foreground/80 text-sm leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="flex items-center gap-3">
                    <div className="p-[2px] rounded-full bg-gradient-to-br from-primary to-chart-4">
                      <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-primary text-xs font-bold">
                        {t.initial}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.author}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section id="pricing" className="relative py-24 lg:py-32 bg-background border-t border-border overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-[-14rem] left-1/2 -translate-x-1/2 w-[60rem] h-[28rem] rounded-full bg-primary/10 blur-3xl" />
        </div>
        <Reveal className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-4 text-balance">
            Ready to get organised?
          </h2>
          <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
            Create your school, invite your team, and start managing — free, no credit card required.
          </p>
          <Button
            size="lg"
            className="px-10 h-13 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
            asChild
          >
            <Link href="/signup">
              Create your school — it&apos;s free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-6 text-sm text-muted-foreground flex items-center justify-center gap-1.5">
            <GraduationCap className="h-4 w-4" />
            Set up in under two minutes
          </p>
        </Reveal>
      </section>
    </div>
  )
}
