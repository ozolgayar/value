import { practiceModernization } from '../data/practiceModernization'
import { PracticeCasePage } from './PracticeCase'

export function PracticeModernizationPage({
  onFinishSection,
}: {
  onFinishSection?: () => void
}) {
  return (
    <PracticeCasePage
      data={practiceModernization}
      onFinishSection={onFinishSection}
    />
  )
}
