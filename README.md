# TeachAssist

A school management platform for administrators and teachers. Manage classrooms, teachers, students, attendance, and staff communication — all from one dashboard.

**Stack:** Next.js 16 · Supabase (Auth + PostgreSQL) · shadcn/ui · Tailwind CSS · OpenAI · Vercel

---

## Features

- **Admin dashboard** — manage teachers, classrooms, and students
- **Teacher invite flow** — invite teachers by email via magic link
- **Attendance tracking** — teachers record daily attendance from any device
- **Real-time messaging** — staff communication channel with Supabase Realtime
- **AI Attendance Insights** — GPT-4o-mini analyses attendance patterns and flags at-risk students
- **AI Lesson Plan Generator** — GPT-4o generates structured lesson plans from a subject and topic
- **Role-based access** — admins and teachers see only what they need (enforced via RLS)
- **PWA** — installable on mobile, works offline

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the three migration files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_triggers.sql`
3. Go to **Authentication → URL Configuration** and set:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/api/auth/callback`

### 3. Configure environment variables

Copy `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENAI_API_KEY=your-openai-api-key
```

Get Supabase keys from **Settings → API** in your project dashboard.
Get an OpenAI key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

> **Never commit `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` to a public repository.**

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## User Flow

```
Landing page (/)
  └── Sign up (/signup)         ← admin creates account
        └── School setup (/setup)
              └── Admin dashboard (/admin)
                    ├── Teachers → invite by email
                    ├── Classrooms → create & assign teachers
                    ├── Students → enroll students
                    ├── Messages → real-time staff chat
                    └── Settings → update school profile

Teacher receives invite email
  └── Sets password → /teacher dashboard
        ├── My Classes → view assigned classrooms
        ├── Classroom → view student roster
        ├── Attendance → take daily attendance
        └── Messages → chat with admin and other teachers
```

---

## Project Structure

```
app/
  (marketing)/        Landing page
  (auth)/             Login + signup
  (app)/
    admin/            Admin dashboard and sub-pages
    teacher/          Teacher dashboard and sub-pages
  api/auth/callback/  Supabase auth callback

components/
  layout/             Sidebars, topbar, navigation
  auth/               Login and signup forms
  shared/             MetricCard, AIInsightsWidget, LessonPlanGenerator
  teachers/           Teacher table and invite dialog
  classrooms/         Classroom table and create dialog
  students/           Student table and add dialog
  messages/           Real-time chat client
  attendance/         Attendance sheet

lib/
  supabase/           Browser, server, and admin clients
  actions/            Server Actions (auth, school, teachers, etc.)
  queries/            Data fetching functions

supabase/migrations/  SQL migration files
types/database.ts     TypeScript types for all tables
```

---

## Deployment (Vercel)

1. Push the repo to a **private** GitHub repository
2. Import the project in [Vercel](https://vercel.com)
3. Add all five environment variables in Vercel project settings
4. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g. `https://teachassist.vercel.app`)
5. In Supabase → **Authentication → URL Configuration**, update:
   - Site URL → your Vercel URL
   - Redirect URLs → `https://your-app.vercel.app/api/auth/callback`

---

## Database Schema

| Table | Description |
|---|---|
| `schools` | School profiles, linked to admin user |
| `users` | User profiles extending `auth.users` (role: admin / teacher) |
| `classrooms` | Classrooms belonging to a school, optionally assigned a teacher |
| `students` | Students enrolled in a school and optionally in a classroom |
| `attendance` | Daily attendance records (present / absent / late) |
| `messages` | Staff messages within a school (real-time enabled) |

Row Level Security is enabled on all tables. Admins manage their school's data; teachers access only their assigned classrooms and students.
