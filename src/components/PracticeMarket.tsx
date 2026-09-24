import { practiceMarket } from '../data/practiceMarket'
import { PracticeCasePage } from './PracticeCase'

export function PracticeMarketPage({
  onFinishSection,
}: {
  onFinishSection?: () => void
}) {
  return <PracticeCasePage data={practiceMarket} onFinishSection={onFinishSection} />
}
