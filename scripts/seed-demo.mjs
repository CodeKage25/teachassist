/**
 * Seed demo accounts + data so the team can log in and explore the dashboard.
 *
 * Usage:  node --env-file=.env.local scripts/seed-demo.mjs
 *
 * Idempotent — safe to re-run. Creates (if missing):
 *   Admin   admin.demo@teachassist.app   / TeachAssist2026!
 *   Teacher teacher.demo@teachassist.app / TeachAssist2026!
 * plus a demo school, two classrooms, ten students, today's attendance
 * and a few staff messages so the dashboards aren't empty.
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } })

const PASSWORD = 'TeachAssist2026!'
const ADMIN_EMAIL = 'admin.demo@teachassist.app'
const TEACHER_EMAIL = 'teacher.demo@teachassist.app'

async function ensureUser(email, metadata) {
  const { data, error } = await db.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: metadata,
  })
  if (!error) return data.user

  // Already exists → look it up
  const { data: list, error: listErr } = await db.auth.admin.listUsers({ perPage: 1000 })
  if (listErr) throw listErr
  const existing = list.users.find((u) => u.email === email)
  if (!existing) throw error
  // Keep the password predictable for the team
  await db.auth.admin.updateUserById(existing.id, { password: PASSWORD, email_confirm: true })
  return existing
}

async function main() {
  console.log('Seeding demo data…')

  // 1. Admin account (profile row created by on_auth_user_created trigger)
  const admin = await ensureUser(ADMIN_EMAIL, { full_name: 'Demo Admin', role: 'admin' })
  console.log(`  admin   ${ADMIN_EMAIL} (${admin.id})`)

  // 2. School
  let { data: school } = await db
    .from('schools')
    .select('*')
    .eq('admin_id', admin.id)
    .maybeSingle()
  if (!school) {
    const { data, error } = await db
      .from('schools')
      .insert({
        name: 'Greenfield Demo High',
        location: 'Lagos, Nigeria',
        contact_email: ADMIN_EMAIL,
        admin_id: admin.id,
      })
      .select()
      .single()
    if (error) throw error
    school = data
  }
  console.log(`  school  ${school.name} (${school.id})`)

  // 3. Link admin profile to school
  await db.from('users').update({ full_name: 'Demo Admin', school_id: school.id }).eq('id', admin.id)

  // 4. Teacher account
  const teacher = await ensureUser(TEACHER_EMAIL, {
    full_name: 'Demo Teacher',
    role: 'teacher',
    school_id: school.id,
  })
  await db
    .from('users')
    .update({ full_name: 'Demo Teacher', role: 'teacher', school_id: school.id })
    .eq('id', teacher.id)
  console.log(`  teacher ${TEACHER_EMAIL} (${teacher.id})`)

  // 5. Classrooms
  const classroomNames = ['JSS 1A', 'JSS 2B']
  const classrooms = []
  for (const name of classroomNames) {
    let { data: room } = await db
      .from('classrooms')
      .select('*')
      .eq('school_id', school.id)
      .eq('name', name)
      .maybeSingle()
    if (!room) {
      const { data, error } = await db
        .from('classrooms')
        .insert({ name, school_id: school.id, teacher_id: teacher.id })
        .select()
        .single()
      if (error) throw error
      room = data
    }
    classrooms.push(room)
  }
  console.log(`  classrooms ${classrooms.map((c) => c.name).join(', ')}`)

  // 6. Students (5 per classroom)
  const studentNames = [
    'Amaka Eze', 'Biodun Adeko', 'Chisom Obi', 'David Lawal', 'Efe Osagie',
    'Fatima Sanni', 'Gozie Okeke', 'Halima Bello', 'Ibrahim Musa', 'Joy Adebayo',
  ]
  const { data: existingStudents } = await db
    .from('students')
    .select('full_name')
    .eq('school_id', school.id)
  const have = new Set((existingStudents ?? []).map((s) => s.full_name))
  const rows = studentNames
    .filter((n) => !have.has(n))
    .map((full_name, i) => ({
      full_name,
      school_id: school.id,
      classroom_id: classrooms[i % classrooms.length].id,
    }))
  if (rows.length) {
    const { error } = await db.from('students').insert(rows)
    if (error) throw error
  }
  console.log(`  students ${studentNames.length} total (${rows.length} new)`)

  // 7. Today's attendance for the first classroom
  const today = new Date().toISOString().slice(0, 10)
  const { data: roomStudents } = await db
    .from('students')
    .select('id')
    .eq('classroom_id', classrooms[0].id)
  const statuses = ['present', 'present', 'late', 'present', 'absent']
  const attendance = (roomStudents ?? []).map((s, i) => ({
    student_id: s.id,
    classroom_id: classrooms[0].id,
    date: today,
    status: statuses[i % statuses.length],
    recorded_by: teacher.id,
  }))
  if (attendance.length) {
    await db.from('attendance').upsert(attendance, {
      onConflict: 'student_id,classroom_id,date',
      ignoreDuplicates: true,
    })
  }
  console.log(`  attendance recorded for ${classrooms[0].name} (${today})`)

  // 8. A few staff messages
  const { count } = await db
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', school.id)
  if (!count) {
    await db.from('messages').insert([
      { school_id: school.id, sender_id: admin.id, content: 'Welcome to TeachAssist! Staff meeting Friday at 2pm.' },
      { school_id: school.id, sender_id: teacher.id, content: 'Noted — JSS 1A attendance is already in for today.' },
      { school_id: school.id, sender_id: admin.id, content: 'Great. Reminder: exam timetable drafts due next week.' },
    ])
  }
  console.log('  messages seeded')

  console.log('\nDone. Log in at /login with:')
  console.log(`  Admin:   ${ADMIN_EMAIL}  /  ${PASSWORD}`)
  console.log(`  Teacher: ${TEACHER_EMAIL}  /  ${PASSWORD}`)
}

main().catch((err) => {
  console.error('Seed failed:', err.message ?? err)
  process.exit(1)
})
