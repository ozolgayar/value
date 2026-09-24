import { ValueSlide } from './ValueSlide'
import { valueResponsibility } from '../data/valueResponsibility'

export function ValueResponsibilityPage() {
  return (
    <ValueSlide pageClass="page-value-responsibility" {...valueResponsibility} />
  )
}
