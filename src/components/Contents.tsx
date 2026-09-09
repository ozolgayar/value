import { BOOK_META, sections } from '../data/book'
import '../styles/contents.css'

interface ContentsProps {
  onStart: () => void
  onSelectSection: (sectionId: string) => void
  onBack: () => void
  /** Kept for compatibility; contents shows instantly (no reveal animation) */
  revealed?: boolean
}

function sectionStartPage(sectionId: string) {
  let page = 1
  for (const s of sections) {
    if (s.id === sectionId) return page
    page += s.paragraphs.reduce((acc, p) => acc + p.pages.length, 0)
  }
  return page
}

export function Contents({ onStart, onSelectSection, onBack }: ContentsProps) {
  return (
    <section className="contents" aria-label="Содержание">
      <div className="contents__pattern contents__pattern--right" aria-hidden />
      <div className="contents__pattern contents__pattern--left" aria-hidden />

      <div className="contents__inner">
        <header className="contents__header">
          <p className="contents__eyebrow">{BOOK_META.subtitle}</p>
          <h1 className="contents__title">Содержание</h1>
          <p className="contents__sub">Выбери раздел или начни читать с первой страницы.</p>
        </header>

        <div className="contents__list" role="list">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className="contents__row"
              role="listitem"
              onClick={() => onSelectSection(section.id)}
            >
              <span className="contents__num">{section.number} —</span>
              <span className="contents__name">{section.title}</span>
              <span className="contents__tag">{section.tag}</span>
              <span className="contents__page">
                С.&nbsp;{String(sectionStartPage(section.id)).padStart(3, '0')}
              </span>
            </button>
          ))}
        </div>

        <footer className="contents__footer">
          <button type="button" className="contents__back" onClick={onBack}>
            ← На главную
          </button>
          <button type="button" className="btn-primary" onClick={onStart}>
            Начать читать
            <span aria-hidden>→</span>
          </button>
        </footer>
      </div>
    </section>
  )
}
