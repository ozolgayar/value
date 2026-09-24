import { practiceHabits } from '../data/practiceHabits'
import { PracticeCasePage } from './PracticeCase'

export function PracticeHabitsPage({
  onFinishSection,
}: {
  onFinishSection?: () => void
}) {
  return <PracticeCasePage data={practiceHabits} onFinishSection={onFinishSection} />
}
