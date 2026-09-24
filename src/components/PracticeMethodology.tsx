import { practiceMethodology } from '../data/practiceMethodology'
import { PracticeCasePage } from './PracticeCase'

export function PracticeMethodologyPage({
  onFinishSection,
}: {
  onFinishSection?: () => void
}) {
  return (
    <PracticeCasePage data={practiceMethodology} onFinishSection={onFinishSection} />
  )
}
