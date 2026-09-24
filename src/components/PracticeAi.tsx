import { practiceAi } from '../data/practiceAi'
import { PracticeCasePage } from './PracticeCase'

export function PracticeAiPage({
  onFinishSection,
}: {
  onFinishSection?: () => void
}) {
  return <PracticeCasePage data={practiceAi} onFinishSection={onFinishSection} />
}
