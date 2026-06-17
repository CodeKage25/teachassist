import { PageHeader } from '@/components/shared/PageHeader'
import { SmartCalendar } from '@/components/teacher/SmartCalendar'

export default function TeacherCalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Smart Calendar"
        description="Manage your schedule and class events"
      />
      <SmartCalendar />
    </div>
  )
}
