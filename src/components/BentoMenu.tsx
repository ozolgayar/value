import { useEffect, useMemo, useState } from 'react'
import { sections, type FlatPage } from '../data/book'
import type { Bookmark } from '../hooks'
import '../styles/menu.css'

interface BentoMenuProps {
  open: boolean
  current: FlatPage
  bookmarks: Bookmark[]
  onClose: () => void
  onGoPageId: (pageId: string) => void
  onRemoveBookmark: (pageId: string) => void
  onExitToContents?: () => void
}

export function BentoMenu({
  open,
  current,
  bookmarks,
  onClose,
  onGoPageId,
  onRemoveBookmark,
  onExitToContents,
}: BentoMenuProps) {
  const [expandedId, setExpandedId] = useState(current.sectionId)

  useEffect(() => {
    if (open) setExpandedId(current.sectionId)
  }, [open, current.sectionId])

  const expanded = useMemo(
    () => sections.find((s) => s.id === expandedId) ?? sections[0],
    [expandedId],
  )

  if (!open) return null

  return (
    <div
      className="menu-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Меню содержания"
      onClick={onClose}
    >
      <div
        className="menu-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="menu-panel__head">
          <h2>Содержание</h2>
          <button type="button" className="menu-close" onClick={onClose} aria-label="Закрыть меню">
            ×
          </button>
        </div>

        {onExitToContents && (
          <button
            type="button"
            className="menu-toc-link"
            onClick={() => {
              onClose()
              onExitToContents()
            }}
          >
            Открыть оглавление книги
          </button>
        )}

        <div className="bento">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`bento__item${section.id === current.sectionId ? ' is-active' : ''}`}
              onClick={() => setExpandedId(section.id)}
            >
              <span className="bento__num">{section.number}</span>
              <span className="bento__title">{section.title}</span>
              <span className="bento__tag">{section.tag}</span>
            </button>
          ))}
        </div>

        <div className="paragraphs">
          <h3>{expanded.title} — параграфы</h3>
          {expanded.paragraphs.map((paragraph) => {
            const firstPage = paragraph.pages[0]
            return (
              <button
                key={paragraph.id}
                type="button"
                className={paragraph.id === current.paragraphId ? 'is-current' : undefined}
                onClick={() => {
                  onGoPageId(firstPage.id)
                  onClose()
                }}
              >
                {paragraph.title}
              </button>
            )
          })}
        </div>

        <div className="bookmarks">
          <h3>Закладки</h3>
          {bookmarks.length === 0 ? (
            <p className="bookmarks__empty">Пока пусто — отметьте страницу кнопкой «Закладка».</p>
          ) : (
            <ul className="bookmarks__list">
              {bookmarks.map((b) => (
                <li key={b.pageId}>
                  <button
                    type="button"
                    onClick={() => {
                      onGoPageId(b.pageId)
                      onClose()
                    }}
                  >
                    {b.label}
                  </button>
                  <button
                    type="button"
                    className="remove"
                    aria-label="Удалить закладку"
                    onClick={() => onRemoveBookmark(b.pageId)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
