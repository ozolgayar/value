import { navIndexForSectionId, navSections, type FlatPage } from '../data/book'
import '../styles/menu.css'

interface BentoMenuProps {
  open: boolean
  current: FlatPage
  onClose: () => void
  onGoPageId: (pageId: string) => void
}

export function BentoMenu({ open, current, onClose, onGoPageId }: BentoMenuProps) {
  if (!open) return null

  const currentNavIndex = navIndexForSectionId(current.sectionId)

  return (
    <div
      className="menu-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Оглавление"
      onClick={onClose}
    >
      <div
        className="menu-panel"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="menu-panel__head">
          <span className="menu-panel__spacer" aria-hidden />
          <h2>Оглавление</h2>
          <button type="button" className="menu-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        <div className="bento">
          {navSections.map((section, i) => {
            const firstPage = section.paragraphs[0]?.pages[0]
            const active = section.id === current.sectionId
            const done = currentNavIndex >= 0 && i < currentNavIndex
            const statusLabel = active ? 'сейчас' : done ? 'пройден' : 'не пройден'
            return (
              <button
                key={section.id}
                type="button"
                className={`bento__item${active ? ' is-active' : ''}${done ? ' is-done' : ''}`}
                onClick={() => {
                  if (firstPage) onGoPageId(firstPage.id)
                  onClose()
                }}
              >
                <span className="bento__row">
                  <span className="bento__num">{section.number}</span>
                  <span
                    className={`bento__status${done ? ' is-done' : ''}${active ? ' is-active' : ''}`}
                    aria-label={statusLabel}
                  >
                    {done ? '✓' : active ? '●' : '○'}
                  </span>
                </span>
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
