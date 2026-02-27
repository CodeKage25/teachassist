import { createClient } from '@/lib/supabase/server'
import { getSchool } from '@/lib/queries/school'
import { PageHeader } from '@/components/shared/PageHeader'
import { redirect } from 'next/navigation'
import { SettingsClient } from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const school = await getSchool()
  if (!school) redirect('/setup')

  return (
    <div>
      <PageHeader
        title="School Settings"
        description="Update your school profile and information"
      />
      <SettingsClient school={school} />
    </div>
  )
}
