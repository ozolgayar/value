import { practiceEquipment } from '../data/practiceEquipment'
import { PracticeCasePage } from './PracticeCase'

export function PracticeEquipmentPage({
  onFinishSection,
}: {
  onFinishSection?: () => void
}) {
  return (
    <PracticeCasePage data={practiceEquipment} onFinishSection={onFinishSection} />
  )
}
