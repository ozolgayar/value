import { practiceErrorFirst } from '../data/practiceErrorFirst'
import { PracticeCasePage } from './PracticeCase'

export function PracticeErrorFirstPage({
  onFinishSection,
}: {
  onFinishSection?: () => void
}) {
  return (
    <PracticeCasePage data={practiceErrorFirst} onFinishSection={onFinishSection} />
  )
}
