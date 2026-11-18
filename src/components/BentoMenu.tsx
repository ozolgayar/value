import { navIndexForSectionId, navSections, type FlatPage } from '../data/book'
import { asset } from '../asset'
import '../styles/menu.css'

interface BentoMenuProps {
  open: boolean
  current: FlatPage
  onClose: () => void
  onGoPageId: (pageId: string) => void
  onQuotes: () => void
}

export function BentoMenu({
  open,
  current,
  onClose,
  onGoPageId,
  onQuotes,
}: BentoMenuProps) {
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
        <header className="menu-panel__head">
          <img
            className="menu-panel__brand"
            src={asset('img/main/logo.svg')}
            alt="ГЕРОФАРМ ТРАНСФОРМАЦИЯ"
          />
          <button
            type="button"
            className="menu-close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
          <h2 className="menu-panel__title">Оглавление</h2>
          <p className="menu-panel__lead">Выбери раздел книги</p>
        </header>

        <nav className="toc" aria-label="Разделы книги">
          {navSections.map((section, i) => {
            const firstPage = section.paragraphs[0]?.pages[0]
            const active = section.id === current.sectionId
            const done = currentNavIndex >= 0 && i < currentNavIndex
            const statusLabel = active
              ? 'сейчас'
              : done
                ? 'пройден'
                : 'не пройден'

            return (
              <button
                key={section.id}
                type="button"
                className={`toc__item${active ? ' is-active' : ''}${done ? ' is-done' : ''}`}
                onClick={() => {
                  if (firstPage) onGoPageId(firstPage.id)
                  onClose()
                }}
              >
                <span className="toc__num" aria-hidden>
                  {section.number}
                </span>
                <span className="toc__copy">
                  <span className="toc__title">{section.title}</span>
                  <span className="toc__desc">{section.summary}</span>
                </span>
                <span className="toc__meta">
                  {active ? (
                    <span className="toc__here">вы здесь</span>
                  ) : (
                    <span
                      className={`toc__status${done ? ' is-done' : ''}`}
                      aria-label={statusLabel}
                    >
                      {done ? '✓' : ''}
                    </span>
                  )}
                  <span className="toc__arrow" aria-hidden>
                    →
                  </span>
                </span>
              </button>
            )
          })}
        </nav>

        <div className="menu-panel__footer">
          <button
            type="button"
            className="menu-service"
            onClick={() => {
              onClose()
              onQuotes()
            }}
          >
            <span
              className="menu-service__icon"
              style={{
                WebkitMaskImage: `url(${asset('icons/notebook-text.svg')})`,
                maskImage: `url(${asset('icons/notebook-text.svg')})`,
              }}
              aria-hidden
            />
            <span>Мои заметки</span>
          </button>
          <button
            type="button"
            className="menu-service"
            onClick={() => {
              onGoPageId('p-journey')
              onClose()
            }}
          >
            <span
              className="menu-service__icon"
              style={{
                WebkitMaskImage: `url(${asset('icons/mail.svg')})`,
                maskImage: `url(${asset('icons/mail.svg')})`,
              }}
              aria-hidden
            />
            <span>Отправить свои предложения</span>
          </button>
        </div>
      </div>
    </div>
  )
}
