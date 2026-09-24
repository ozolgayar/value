import { practiceLongTerm } from '../data/practiceLongTerm'
import { PracticeCasePage } from './PracticeCase'

export function PracticeLongTermPage({
  onFinishSection,
}: {
  onFinishSection?: () => void
}) {
  return (
    <PracticeCasePage data={practiceLongTerm} onFinishSection={onFinishSection} />
  )
}
