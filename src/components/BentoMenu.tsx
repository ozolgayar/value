import { navSections, type FlatPage } from '../data/book'
import '../styles/menu.css'

interface BentoMenuProps {
  open: boolean
  current: FlatPage
  onClose: () => void
  onBack: () => void
  onGoPageId: (pageId: string) => void
}

export function BentoMenu({ open, current, onClose, onBack, onGoPageId }: BentoMenuProps) {
  if (!open) return null

  return (
    <div
      className="menu-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Содержание"
      onClick={onClose}
    >
      <div className="menu-panel" onClick={(e) => e.stopPropagation()}>
        <div className="menu-panel__head">
          <button
            type="button"
            className="menu-back"
            onClick={onBack}
            aria-label="Назад в меню"
          >
            <span aria-hidden>←</span>
          </button>
          <h2>Содержание</h2>
          <button type="button" className="menu-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        <div className="bento">
          {navSections.map((section) => {
            const firstPage = section.paragraphs[0]?.pages[0]
            const active = section.id === current.sectionId
            return (
              <button
                key={section.id}
                type="button"
                className={`bento__item${active ? ' is-active' : ''}`}
                onClick={() => {
                  if (firstPage) onGoPageId(firstPage.id)
                  onClose()
                }}
              >
                <span className="bento__num">{section.number}</span>
                <span className="bento__title">{section.title}</span>
                <span className="bento__tag">{section.tag}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
