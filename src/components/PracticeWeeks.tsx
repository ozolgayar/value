import { practiceWeeks } from '../data/practiceWeeks'
import { PracticeCasePage } from './PracticeCase'

export function PracticeWeeksPage({
  onFinishSection,
}: {
  onFinishSection?: () => void
}) {
  return <PracticeCasePage data={practiceWeeks} onFinishSection={onFinishSection} />
}
