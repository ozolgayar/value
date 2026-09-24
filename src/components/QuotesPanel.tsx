import type { Quote } from '../hooks'
import '../styles/quotes.css'

interface QuotesPanelProps {
  open: boolean
  quotes: Quote[]
  onClose: () => void
  onBack: () => void
  onRemove: (id: string) => void
  onGoPageId: (pageId: string) => void
}

export function QuotesPanel({
  open,
  quotes,
  onClose,
  onBack,
  onRemove,
  onGoPageId,
}: QuotesPanelProps) {
  if (!open) return null

  return (
    <div className="quotes-overlay" role="dialog" aria-modal aria-label="Заметки" onClick={onClose}>
      <div className="quotes-panel" onClick={(e) => e.stopPropagation()}>
        <div className="quotes-panel__head">
          <button type="button" className="quotes-back" onClick={onBack} aria-label="Назад в меню">
            <span aria-hidden>←</span>
          </button>
          <h2>Заметки</h2>
          <button type="button" className="quotes-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        {quotes.length === 0 ? (
          <p className="quotes-panel__empty">
            Пока пусто. Выдели текст на странице и нажми кнопку с блокнотом.
          </p>
        ) : (
          <ul className="quotes-panel__list">
            {quotes.map((q) => (
              <li key={q.id} className="quotes-panel__item">
                <blockquote>«{q.text}»</blockquote>
                <div className="quotes-panel__meta">
                  <button
                    type="button"
                    className="quotes-panel__goto"
                    onClick={() => {
                      onGoPageId(q.pageId)
                      onClose()
                    }}
                  >
                    {q.pageLabel}
                  </button>
                  <button
                    type="button"
                    className="quotes-panel__remove"
                    aria-label="Удалить заметку"
                    onClick={() => onRemove(q.id)}
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
