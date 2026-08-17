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

  // 9. Kcolos: parent account, guardian links, assessments, sample report
  //    (requires supabase/migrations/005_kcolos.sql)
  try {
    await seedKcolos(school, teacher)
  } catch (err) {
    console.warn(
      '\n  ⚠ Kcolos seed skipped — run supabase/migrations/005_kcolos.sql first.',
      `(${err.message ?? err})`
    )
  }

  console.log('\nDone. Log in at /login with:')
  console.log(`  Admin:   ${ADMIN_EMAIL}  /  ${PASSWORD}`)
  console.log(`  Teacher: ${TEACHER_EMAIL}  /  ${PASSWORD}`)
  console.log(`  Parent:  ${PARENT_EMAIL}  /  ${PASSWORD}`)
}

const PARENT_EMAIL = 'parent.demo@teachassist.app'
const TERM = 'Term 3 2026'

async function seedKcolos(school, teacher) {
  const parent = await ensureUser(PARENT_EMAIL, {
    full_name: 'Demo Parent',
    role: 'parent',
    school_id: school.id,
  })
  await db
    .from('users')
    .update({ full_name: 'Demo Parent', role: 'parent', school_id: school.id })
    .eq('id', parent.id)
  console.log(`  parent  ${PARENT_EMAIL} (${parent.id})`)

  const { data: room } = await db
    .from('classrooms')
    .select('id, name')
    .eq('school_id', school.id)
    .eq('name', 'JSS 1A')
    .single()
  const { data: roomStudents } = await db
    .from('students')
    .select('id, full_name')
    .eq('classroom_id', room.id)
    .order('full_name')

  // Link the parent to the first two students
  const children = (roomStudents ?? []).slice(0, 2)
  for (const [i, child] of children.entries()) {
    const { error } = await db.from('student_guardians').upsert(
      {
        parent_id: parent.id,
        student_id: child.id,
        relationship: i === 0 ? 'Mother' : 'Guardian',
      },
      { onConflict: 'parent_id,student_id' }
    )
    if (error) throw error
  }
  console.log(`  guardians linked: ${children.map((c) => c.full_name).join(', ')}`)

  // Assessments + results
  const defs = [
    { subject: 'Mathematics', title: 'First CA Test — Fractions', type: 'ca', max_score: 20 },
    { subject: 'English', title: 'First CA Test — Comprehension', type: 'ca', max_score: 20 },
    { subject: 'Mathematics', title: 'Mid-term Exam', type: 'exam', max_score: 100 },
  ]
  const scorePatterns = [
    [17, 12, 15, 9, 18],
    [14, 16, 11, 13, 19],
    [82, 55, 71, 44, 90],
  ]

  for (const [di, def] of defs.entries()) {
    let { data: assessment } = await db
      .from('assessments')
      .select('id')
      .eq('classroom_id', room.id)
      .eq('title', def.title)
      .eq('term', TERM)
      .maybeSingle()
    if (!assessment) {
      const { data, error } = await db
        .from('assessments')
        .insert({
          school_id: school.id,
          classroom_id: room.id,
          subject: def.subject,
          title: def.title,
          type: def.type,
          term: TERM,
          max_score: def.max_score,
          created_by: teacher.id,
        })
        .select('id')
        .single()
      if (error) throw error
      assessment = data
    }
    const rows = (roomStudents ?? []).map((s, si) => ({
      assessment_id: assessment.id,
      student_id: s.id,
      score: scorePatterns[di][si % scorePatterns[di].length],
    }))
    const { error } = await db
      .from('assessment_results')
      .upsert(rows, { onConflict: 'assessment_id,student_id' })
    if (error) throw error
  }
  console.log(`  assessments seeded (${defs.length}) with results for ${room.name}`)

  // One published sample report for the first child
  const child = children[0]
  if (child) {
    const { error } = await db.from('student_reports').upsert(
      {
        school_id: school.id,
        student_id: child.id,
        classroom_id: room.id,
        teacher_id: teacher.id,
        term: TERM,
        status: 'published',
        summary: `${child.full_name} has had a strong term overall. Mathematics is a clear strength — consistent high scores in both the CA test and mid-term exam. English comprehension is solid but has room to grow with regular reading practice at home.`,
        strengths: [
          'Excellent grasp of fractions — scored 17/20 on the first CA test',
          'Strong exam technique: 82% on the Mathematics mid-term',
          'Consistent attendance and punctuality this term',
        ],
        focus_areas: [
          {
            area: 'English — Reading comprehension',
            observation: 'Scored 14/20 on the comprehension CA, losing marks on inference questions.',
            suggestion: 'Pair guided reading passages with short verbal quizzes on "why" and "how" questions.',
            home_support: 'Read a short story together twice a week and ask two or three questions about why characters acted the way they did.',
            resources: [
              {
                type: 'youtube',
                title: 'Reading comprehension strategies for kids',
                url: 'https://www.youtube.com/results?search_query=reading+comprehension+strategies+for+kids',
              },
              { type: 'practice', title: 'One short comprehension passage per weekend', url: '' },
              { type: 'reading', title: 'Age-appropriate storybooks with question prompts', url: '' },
            ],
          },
        ],
        teacher_note: `${child.full_name.split(' ')[0]} is a joy to teach — with a little more reading at home, next term's results will be even stronger.`,
        published_at: new Date().toISOString(),
      },
      { onConflict: 'student_id,term' }
    )
    if (error) throw error
    console.log(`  published sample report for ${child.full_name} (${TERM})`)
  }
}

main().catch((err) => {
  console.error('Seed failed:', err.message ?? err)
  process.exit(1)
})
