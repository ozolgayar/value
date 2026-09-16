export type PracticeCaseData = {
  left: {
    badge: string
    title: string
    situationLabel: string
    situation: string
    optionsLabel: string
    options: { key: string; text: string }[]
  }
  right: {
    title: string
    bestLabel: string
    bestOption: string
    values: { icon: string; text: string }[]
    resultLabel: string
    result: string
  }
}
