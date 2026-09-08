import { BOOK_META, sections } from '../data/book'
import '../styles/contents.css'

interface ContentsProps {
  onStart: () => void
  onSelectSection: (sectionId: string) => void
  onBack: () => void
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
      <div className="contents__inner">
        <header className="contents__header">
          <p className="contents__eyebrow">{BOOK_META.subtitle}</p>
          <h1 className="contents__title">Содержание</h1>
          <p className="contents__sub">
            Интерактивное оглавление культурного путеводителя. Выберите раздел или начните читать с
            первой страницы.
          </p>
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
                P. {String(sectionStartPage(section.id)).padStart(3, '0')}
              </span>
            </button>
          ))}
        </div>

        <footer className="contents__footer">
          <button type="button" className="btn-ghost contents__back" onClick={onBack}>
            ← К обложке
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
