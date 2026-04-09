import { PageHeader } from '@/components/shared/PageHeader'
import { LessonPlanForm } from '@/components/shared/LessonPlanForm'

export default function TeacherLessonPlanPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Lesson Plan Generator"
        description="Upload your scheme of work and generate a detailed lesson plan with AI"
      />
      <LessonPlanForm />
    </div>
  )
}
