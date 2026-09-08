import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react'
import { flatPages, totalPages, type FlatPage } from '../data/book'
import { useBookmarks, useMediaQuery } from '../hooks'
import { BentoMenu } from './BentoMenu'
import { PageView } from './PageView'
import '../styles/reader.css'

interface ReaderProps {
  initialIndex?: number
  onExitToContents: () => void
}

function labelFor(fp: FlatPage) {
  return fp.page.title ?? fp.paragraphTitle
}

export function Reader({ initialIndex = 0, onExitToContents }: ReaderProps) {
  const isMobile = useMediaQuery('(max-width: 860px)')
  const [index, setIndex] = useState(initialIndex)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hintVisible, setHintVisible] = useState(true)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const { bookmarks, isBookmarked, toggle, remove } = useBookmarks()

  useEffect(() => {
    setIndex(Math.min(Math.max(initialIndex, 0), totalPages - 1))
  }, [initialIndex])

  useEffect(() => {
    const t = window.setTimeout(() => setHintVisible(false), 5000)
    return () => window.clearTimeout(t)
  }, [])

  const current = flatPages[index]
  const bookProgress = ((index + 1) / totalPages) * 100
  const sectionProgress = ((current.sectionPageIndex + 1) / current.sectionPageCount) * 100

  const go = useCallback((next: number) => {
    setIndex(Math.min(Math.max(next, 0), totalPages - 1))
  }, [])

  const goById = useCallback((pageId: string) => {
    const found = flatPages.findIndex((p) => p.page.id === pageId)
    if (found >= 0) setIndex(found)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (menuOpen) {
        if (e.key === 'Escape') setMenuOpen(false)
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        go(index + 1)
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        go(index - 1)
      }
      if (e.key === 'Escape') setMenuOpen(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, index, menuOpen])

  const onTouchStart = (e: TouchEvent) => {
    const t = e.changedTouches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchEnd = (e: TouchEvent) => {
    if (!touchStart.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    touchStart.current = null
    const threshold = 48
    if (isMobile) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > threshold) {
        go(dy < 0 ? index + 1 : index - 1)
      }
    } else if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
      go(dx < 0 ? index + 1 : index - 1)
    }
  }

  const trackStyle = useMemo(() => {
    if (isMobile) {
      return { transform: `translate3d(0, ${-index * 100}%, 0)` }
    }
    return { transform: `translate3d(${-index * 100}%, 0, 0)` }
  }, [index, isMobile])

  return (
    <section
      className={`reader${isMobile ? ' is-vertical' : ''}`}
      aria-label="Чтение книги"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="reader__track" style={trackStyle}>
        {flatPages.map((fp) => (
          <div className="reader__page" key={fp.page.id} aria-hidden={fp.globalIndex !== index}>
            <PageView page={fp.page} />
          </div>
        ))}
      </div>

      <div className="reader__chrome">
        <div className="reader__progress" aria-hidden>
          <div className="reader__progress-book" style={{ width: `${bookProgress}%` }} />
          <div className="reader__progress-section" style={{ width: `${sectionProgress}%` }} />
        </div>

        <div className="reader__top">
          <button type="button" className="tool-btn" onClick={() => setMenuOpen(true)}>
            Содержание
          </button>
          <div className="reader__tools">
            <button
              type="button"
              className={`tool-btn${isBookmarked(current.page.id) ? ' is-on' : ''}`}
              onClick={() => toggle(current.page.id, labelFor(current))}
            >
              {isBookmarked(current.page.id) ? 'В закладках' : 'Закладка'}
            </button>
          </div>
        </div>

        {!isMobile && (
          <>
            <button
              type="button"
              className="nav-arrow nav-arrow--prev"
              aria-label="Предыдущая страница"
              disabled={index === 0}
              onClick={() => go(index - 1)}
            >
              ←
            </button>
            <button
              type="button"
              className="nav-arrow nav-arrow--next"
              aria-label="Следующая страница"
              disabled={index >= totalPages - 1}
              onClick={() => go(index + 1)}
            >
              →
            </button>
          </>
        )}

        <div className="reader__bottom">
          <div className="reader__pager">
            Стр. {index + 1} / {totalPages}
            <span aria-hidden> · </span>
            {current.sectionPageIndex + 1}/{current.sectionPageCount} в разделе
          </div>
          {hintVisible && (
            <div className="reader__hint">
              {isMobile
                ? 'Листайте вертикально свайпом вверх/вниз'
                : 'Листайте кнопками ← → или клавишами влево/вправо'}
            </div>
          )}
        </div>
      </div>

      <BentoMenu
        open={menuOpen}
        current={current}
        bookmarks={bookmarks}
        onClose={() => setMenuOpen(false)}
        onGoPageId={goById}
        onRemoveBookmark={remove}
        onExitToContents={onExitToContents}
      />
    </section>
  )
}
