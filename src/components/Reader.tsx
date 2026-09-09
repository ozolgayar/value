import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react'
import { flatPages, sections, totalPages } from '../data/book'
import { useMediaQuery, useQuotes } from '../hooks'
import { BentoMenu } from './BentoMenu'
import { PageView } from './PageView'
import { QuotesPanel } from './QuotesPanel'
import { RollUpMenu } from './RollUpMenu'
import '../styles/reader.css'
import '../styles/quotes.css'

interface ReaderProps {
  initialIndex?: number
  onExitToHome: () => void
}

function labelFor(index: number) {
  const fp = flatPages[index]
  return fp.page.title ?? fp.paragraphTitle
}

export function Reader({ initialIndex = 0, onExitToHome }: ReaderProps) {
  const isMobile = useMediaQuery('(max-width: 860px)')
  const [index, setIndex] = useState(initialIndex)
  const [rollOpen, setRollOpen] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)
  const [quotesOpen, setQuotesOpen] = useState(false)
  const [hintVisible, setHintVisible] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [selectionUi, setSelectionUi] = useState<{ text: string; x: number; y: number } | null>(
    null,
  )
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const suppressSwipe = useRef(false)
  const { quotes, add: addQuote, remove: removeQuote } = useQuotes()

  const current = flatPages[index]
  const anyOverlay = rollOpen || tocOpen || quotesOpen

  const sectionCount = sections.length
  const sectionProgress = useMemo(() => {
    const count = Math.max(1, current.sectionPageCount)
    const local = (current.sectionPageIndex + 1) / count
    if (sectionCount <= 1) return local
    // Fill travels from node 0 → node 7 as sections are read
    return Math.min(1, (current.sectionIndex + local) / (sectionCount - 1))
  }, [current.sectionIndex, current.sectionPageIndex, current.sectionPageCount, sectionCount])

  useEffect(() => {
    setIndex(Math.min(Math.max(initialIndex, 0), totalPages - 1))
  }, [initialIndex])

  useEffect(() => {
    const KEY = 'gph-reader-nav-hint-seen'
    try {
      if (localStorage.getItem(KEY)) return
      setHintVisible(true)
      const t = window.setTimeout(() => {
        setHintVisible(false)
        localStorage.setItem(KEY, '1')
      }, 4500)
      return () => window.clearTimeout(t)
    } catch {
      setHintVisible(true)
      const t = window.setTimeout(() => setHintVisible(false), 4500)
      return () => window.clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2000)
    return () => window.clearTimeout(t)
  }, [toast])

  useEffect(() => {
    const onSelectionChange = () => {
      if (anyOverlay) {
        setSelectionUi(null)
        return
      }
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        setSelectionUi(null)
        return
      }
      const text = sel.toString().replace(/\s+/g, ' ').trim()
      if (text.length < 2) {
        setSelectionUi(null)
        return
      }
      const range = sel.getRangeAt(0)
      const readerRoot = document.querySelector('.reader')
      if (!readerRoot || !readerRoot.contains(range.commonAncestorContainer)) {
        setSelectionUi(null)
        return
      }
      const rect = range.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) {
        setSelectionUi(null)
        return
      }
      setSelectionUi({
        text,
        x: rect.left + rect.width / 2,
        y: Math.max(rect.top, 48),
      })
    }

    document.addEventListener('selectionchange', onSelectionChange)
    return () => document.removeEventListener('selectionchange', onSelectionChange)
  }, [anyOverlay])

  const go = useCallback((next: number) => {
    setIndex(Math.min(Math.max(next, 0), totalPages - 1))
  }, [])

  const goById = useCallback((pageId: string) => {
    const found = flatPages.findIndex((p) => p.page.id === pageId)
    if (found >= 0) setIndex(found)
  }, [])

  const goToSection = useCallback(
    (sectionIndex: number) => {
      const section = sections[sectionIndex]
      const firstPage = section?.paragraphs[0]?.pages[0]
      if (firstPage) {
        const found = flatPages.findIndex((p) => p.page.id === firstPage.id)
        if (found >= 0) setIndex(found)
      }
    },
    [],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (anyOverlay) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        go(index + 1)
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        go(index - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, index, anyOverlay])

  const onTouchStart = (e: TouchEvent) => {
    const t = e.changedTouches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchEnd = (e: TouchEvent) => {
    if (!touchStart.current || anyOverlay || suppressSwipe.current) {
      suppressSwipe.current = false
      touchStart.current = null
      return
    }
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

  const handleAddQuote = () => {
    if (!selectionUi) return
    const ok = addQuote(selectionUi.text, current.page.id, labelFor(index))
    setToast(ok ? 'Добавлено в цитаты' : 'Эта цитата уже сохранена')
    setSelectionUi(null)
    window.getSelection()?.removeAllRanges()
  }

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
        <div
          className="reader__progress"
          role="navigation"
          aria-label="Прогресс по разделам"
        >
          <div className="reader__progress-track" aria-hidden>
            <div
              className="reader__progress-fill"
              style={{ width: `${sectionProgress * 100}%` }}
            />
          </div>
          <div className="reader__progress-nodes">
            {sections.map((section, i) => {
              const done = i < current.sectionIndex
              const active = i === current.sectionIndex
              return (
                <button
                  key={section.id}
                  type="button"
                  className={`reader__progress-node${done ? ' is-done' : ''}${active ? ' is-active' : ''}`}
                  aria-label={`Раздел ${section.number}: ${section.title}`}
                  aria-current={active ? 'step' : undefined}
                  disabled={anyOverlay}
                  onClick={() => goToSection(i)}
                >
                  {Number(section.number) || i + 1}
                </button>
              )
            })}
          </div>
        </div>

        {!isMobile && (
          <>
            <button
              type="button"
              className="nav-arrow nav-arrow--prev"
              aria-label="Предыдущая страница"
              disabled={index === 0 || anyOverlay}
              onClick={() => go(index - 1)}
            >
              ←
            </button>
            <button
              type="button"
              className="nav-arrow nav-arrow--next"
              aria-label="Следующая страница"
              disabled={index >= totalPages - 1 || anyOverlay}
              onClick={() => go(index + 1)}
            >
              →
            </button>
          </>
        )}

        <div className="reader__pager" aria-live="polite">
          {index + 1} / {totalPages}
        </div>

        {hintVisible && (
          <div className="reader__hint">
            {isMobile
              ? 'Листайте вертикально свайпом вверх/вниз'
              : 'Листайте кнопками ← → или клавишами влево/вправо'}
          </div>
        )}

        {toast && (
          <div className="reader__toast" role="status">
            {toast}
          </div>
        )}
      </div>

      {selectionUi && (
        <button
          type="button"
          className="quote-pop"
          style={{ left: selectionUi.x, top: selectionUi.y }}
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={() => {
            suppressSwipe.current = true
          }}
          onClick={handleAddQuote}
        >
          Добавить в цитаты
        </button>
      )}

      <RollUpMenu
        open={rollOpen}
        onToggle={() => setRollOpen((v) => !v)}
        onClose={() => setRollOpen(false)}
        onContents={() => setTocOpen(true)}
        onHome={onExitToHome}
        onQuotes={() => setQuotesOpen(true)}
      />

      <BentoMenu
        open={tocOpen}
        current={current}
        onClose={() => setTocOpen(false)}
        onBack={() => {
          setTocOpen(false)
          setRollOpen(true)
        }}
        onGoPageId={goById}
      />

      <QuotesPanel
        open={quotesOpen}
        quotes={quotes}
        onClose={() => setQuotesOpen(false)}
        onBack={() => {
          setQuotesOpen(false)
          setRollOpen(true)
        }}
        onRemove={removeQuote}
        onGoPageId={goById}
      />
    </section>
  )
}
