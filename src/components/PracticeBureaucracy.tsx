import { practiceBureaucracy } from '../data/practiceBureaucracy'
import { PracticeCasePage } from './PracticeCase'

export function PracticeBureaucracyPage({
  onFinishSection,
}: {
  onFinishSection?: () => void
}) {
  return (
    <PracticeCasePage data={practiceBureaucracy} onFinishSection={onFinishSection} />
  )
}
