import { PageHeader } from '@/components/shared/PageHeader'
import { GameGenerator } from '@/components/teacher/GameGenerator'

export default function TeacherGamesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Quiz Game Generator"
        description="Generate interactive quizzes powered by AI for classroom engagement"
      />
      <GameGenerator />
    </div>
  )
}
