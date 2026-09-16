import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react'
import { flatPages, navIndexForSectionId, navSections, totalPages } from '../data/book'
import {
  getHistoryPage,
  getHistoryPageIndexForYear,
  getYearIndexOnPage,
  historyBookPageId,
} from '../data/history'
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
  const [zoomPhase, setZoomPhase] = useState<'idle' | 'out' | 'in'>('idle')
  const [historyCurtain, setHistoryCurtain] = useState<null | {
    phase: 'start' | 'cover' | 'exit'
    dir: 'next' | 'prev'
    color: string
    years: string[]
    from: number
    to: number
  }>(null)
  const [missionSlide, setMissionSlide] = useState<null | {
    phase: 'start' | 'cover' | 'exit'
    dir: 'next' | 'prev'
  }>(null)
  const [historyRevealed, setHistoryRevealed] = useState<Record<string, number[]>>({})
  const [historyHint, setHistoryHint] = useState(true)
  const [historyJumpYear, setHistoryJumpYear] = useState<string | null>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const suppressSwipe = useRef(false)
  const zoomTimers = useRef<number[]>([])
  const curtainTimers = useRef<number[]>([])
  const slideTimers = useRef<number[]>([])
  const { quotes, add: addQuote, remove: removeQuote } = useQuotes()

  const current = flatPages[index]
  const anyOverlay = rollOpen || tocOpen || quotesOpen
  const isInterstitial = current.page.kind === 'interstitial'
  const isClosingCover = current.page.kind === 'closing-cover'
  const isHistoryEra = current.page.kind === 'history-era'
  const chromeHidden =
    isInterstitial ||
    isClosingCover ||
    zoomPhase !== 'idle' ||
    !!historyCurtain ||
    !!missionSlide

  const historyAccent = (accent: 'purple' | 'blue') =>
    accent === 'blue' ? '#1e3a8a' : '#7c3aed'

  const isMissionKind = (kind: string) =>
    kind === 'mission-statement' ||
    kind === 'mission-ecosystem' ||
    kind === 'mission-longevity' ||
    kind === 'mission-strategy-spread' ||
    kind === 'mission-strategy-house' ||
    kind === 'mission-uniqueness' ||
    kind === 'values-spread' ||
    kind === 'value-ambition' ||
    kind === 'value-passion' ||
    kind === 'value-responsibility' ||
    kind === 'mastery-semavic' ||
    kind === 'mastery-venezuela' ||
    kind === 'mastery-third-line' ||
    kind === 'mastery-putin' ||
    kind === 'practice-equipment' ||
    kind === 'practice-weeks' ||
    kind === 'practice-error-first' ||
    kind === 'practice-market' ||
    kind === 'practice-modernization' ||
    kind === 'practice-ai' ||
    kind === 'practice-long-term' ||
    kind === 'practice-methodology' ||
    kind === 'practice-bureaucracy' ||
    kind === 'practice-habits'
  const currentHistoryPage = useMemo(() => {
    if (!isHistoryEra) return null
    return getHistoryPage(Number(current.page.meta?.historyPage ?? 0))
  }, [isHistoryEra, current.page.meta?.historyPage])

  const revealedSet = useMemo(() => {
    const arr = historyRevealed[current.page.id] ?? []
    return new Set(arr)
  }, [historyRevealed, current.page.id])

  const revealHistoryYear = useCallback(
    (yearIndex: number) => {
      const pageId = current.page.id
      setHistoryRevealed((prev) => {
        const cur = new Set(prev[pageId] ?? [])
        if (cur.has(yearIndex)) return prev
        cur.add(yearIndex)
        setHistoryHint(false)
        return { ...prev, [pageId]: [...cur].sort((a, b) => a - b) }
      })
    },
    [current.page.id],
  )

  const revealNextHistoryYear = useCallback(() => {
    if (!currentHistoryPage) return false
    const cur = revealedSet
    for (let i = 0; i < currentHistoryPage.years.length; i++) {
      if (!cur.has(i)) {
        revealHistoryYear(i)
        return true
      }
    }
    return false
  }, [currentHistoryPage, revealedSet, revealHistoryYear])

  const sectionCount = navSections.length
  const navSectionIndex = navIndexForSectionId(current.sectionId)
  const sectionProgress = useMemo(() => {
    if (navSectionIndex < 0) return 0
    const count = Math.max(1, current.sectionPageCount)
    const local = (current.sectionPageIndex + 1) / count
    if (sectionCount <= 1) return local
    return Math.min(1, (navSectionIndex + local) / (sectionCount - 1))
  }, [navSectionIndex, current.sectionPageIndex, current.sectionPageCount, sectionCount])

  const clearZoomTimers = useCallback(() => {
    zoomTimers.current.forEach((id) => window.clearTimeout(id))
    zoomTimers.current = []
  }, [])

  const clearCurtainTimers = useCallback(() => {
    curtainTimers.current.forEach((id) => window.clearTimeout(id))
    curtainTimers.current = []
  }, [])

  const clearSlideTimers = useCallback(() => {
    slideTimers.current.forEach((id) => window.clearTimeout(id))
    slideTimers.current = []
  }, [])

  useEffect(
    () => () => {
      clearZoomTimers()
      clearCurtainTimers()
      clearSlideTimers()
    },
    [clearZoomTimers, clearCurtainTimers, clearSlideTimers],
  )

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

  const go = useCallback(
    (next: number, opts?: { force?: boolean }) => {
      const clamped = Math.min(Math.max(next, 0), totalPages - 1)
      if (zoomPhase !== 'idle' || historyCurtain || missionSlide) return
      if (clamped === index) return

      // History: reveal all year cards before advancing to the next page
      if (
        !opts?.force &&
        isHistoryEra &&
        currentHistoryPage &&
        clamped === index + 1
      ) {
        if (revealedSet.size < currentHistoryPage.years.length) {
          revealNextHistoryYear()
          return
        }
      }

      if (flatPages[clamped]?.page.kind === 'history-era') {
        setHistoryHint(true)
      }

      const targetKind = flatPages[clamped]?.page.kind
      const currentKind = flatPages[index]?.page.kind
      const cinematic =
        !isMobile && (targetKind === 'interstitial' || currentKind === 'interstitial')

      const historyToHistory =
        currentKind === 'history-era' && targetKind === 'history-era'
      const missionFlow = isMissionKind(currentKind) && isMissionKind(targetKind)
      const reduceMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (historyToHistory && !reduceMotion) {
        clearCurtainTimers()
        const dir = clamped > index ? 'next' : 'prev'
        const fromPage = getHistoryPage(Number(flatPages[index].page.meta?.historyPage ?? 0))
        const toPage = getHistoryPage(Number(flatPages[clamped].page.meta?.historyPage ?? 0))
        const color = historyAccent(toPage.accent)
        const years = (dir === 'next' ? toPage : fromPage).years.map((y) => y.year)

        setHistoryCurtain({
          phase: 'start',
          dir,
          color,
          years,
          from: index,
          to: clamped,
        })

        const tArm = window.setTimeout(() => {
          setHistoryCurtain((prev) => (prev ? { ...prev, phase: 'cover' } : null))
        }, 20)

        const t1 = window.setTimeout(() => {
          setIndex(clamped)
          setHistoryCurtain((prev) => (prev ? { ...prev, phase: 'exit' } : null))
          const t2 = window.setTimeout(() => setHistoryCurtain(null), 520)
          curtainTimers.current.push(t2)
        }, 640)
        curtainTimers.current.push(tArm, t1)
        return
      }

      // Mission pages: horizontal slide to the right (like the video, but sideways)
      if (missionFlow && !reduceMotion) {
        clearSlideTimers()
        const dir = clamped > index ? 'next' : 'prev'
        setMissionSlide({ phase: 'start', dir })
        const tArm = window.setTimeout(() => {
          setMissionSlide((prev) => (prev ? { ...prev, phase: 'cover' } : null))
        }, 20)
        const t1 = window.setTimeout(() => {
          setIndex(clamped)
          setMissionSlide((prev) => (prev ? { ...prev, phase: 'exit' } : null))
          const t2 = window.setTimeout(() => setMissionSlide(null), 520)
          slideTimers.current.push(t2)
        }, 640)
        slideTimers.current.push(tArm, t1)
        return
      }

      if (!cinematic) {
        setIndex(clamped)
        return
      }

      clearZoomTimers()
      setZoomPhase('out')
      const t1 = window.setTimeout(() => {
        setIndex(clamped)
        setZoomPhase('in')
        const t2 = window.setTimeout(() => setZoomPhase('idle'), 980)
        zoomTimers.current.push(t2)
      }, 420)
      zoomTimers.current.push(t1)
    },
    [
      index,
      zoomPhase,
      historyCurtain,
      missionSlide,
      isMobile,
      clearZoomTimers,
      clearCurtainTimers,
      clearSlideTimers,
      isHistoryEra,
      currentHistoryPage,
      revealedSet,
      revealNextHistoryYear,
    ],
  )

  const jumpToHistoryYear = useCallback(
    (year: string) => {
      const pageIndex = getHistoryPageIndexForYear(year)
      const yearOnPage = getYearIndexOnPage(year)
      if (pageIndex < 0 || yearOnPage < 0) return

      const pageId = historyBookPageId(pageIndex)
      setHistoryRevealed((prev) => {
        const cur = new Set(prev[pageId] ?? [])
        for (let i = 0; i <= yearOnPage; i++) cur.add(i)
        return { ...prev, [pageId]: [...cur].sort((a, b) => a - b) }
      })
      setHistoryHint(false)
      setHistoryJumpYear(year)

      const found = flatPages.findIndex((p) => p.page.id === pageId)
      if (found < 0) return
      if (found === index) return
      go(found, { force: true })
    },
    [go, index],
  )

  const clearHistoryJumpYear = useCallback(() => {
    setHistoryJumpYear(null)
  }, [])

  const goById = useCallback(
    (pageId: string) => {
      const found = flatPages.findIndex((p) => p.page.id === pageId)
      if (found >= 0) go(found)
    },
    [go],
  )

  const goToSection = useCallback(
    (sectionIndex: number) => {
      const section = navSections[sectionIndex]
      const firstPage = section?.paragraphs[0]?.pages[0]
      if (firstPage) goById(firstPage.id)
    },
    [goById],
  )

  const goToSectionId = useCallback(
    (sectionId: string) => {
      const found = flatPages.findIndex((p) => p.sectionId === sectionId)
      if (found >= 0) go(found)
    },
    [go],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (anyOverlay || zoomPhase !== 'idle' || historyCurtain || missionSlide) return
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
  }, [go, index, anyOverlay, zoomPhase, historyCurtain, missionSlide])

  const onTouchStart = (e: TouchEvent) => {
    const t = e.changedTouches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchEnd = (e: TouchEvent) => {
    if (
      !touchStart.current ||
      anyOverlay ||
      suppressSwipe.current ||
      zoomPhase !== 'idle' ||
      historyCurtain ||
      missionSlide
    ) {
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
    const transform = isMobile
      ? `translate3d(0, ${-index * 100}%, 0)`
      : `translate3d(${-index * 100}%, 0, 0)`
    return {
      transform,
      transition:
        zoomPhase !== 'idle' || historyCurtain || missionSlide ? 'none' : undefined,
    }
  }, [index, isMobile, zoomPhase, historyCurtain, missionSlide])

  const handleAddQuote = () => {
    if (!selectionUi) return
    const ok = addQuote(selectionUi.text, current.page.id, labelFor(index))
    setToast(ok ? 'Добавлено в цитаты' : 'Эта цитата уже сохранена')
    setSelectionUi(null)
    window.getSelection()?.removeAllRanges()
  }

  const transitionBusy = !!historyCurtain || !!missionSlide

  return (
    <section
      className={`reader${isMobile ? ' is-vertical' : ''}${
        zoomPhase === 'out' ? ' is-zoom-out' : ''
      }${zoomPhase === 'in' ? ' is-zoom-in' : ''}${isInterstitial ? ' is-interstitial' : ''}${
        isHistoryEra ? ' is-history' : ''
      }`}
      aria-label="Чтение книги"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="reader__track" style={trackStyle} key={`track-${totalPages}`}>
        {flatPages.map((fp) => (
          <div
            className="reader__page"
            key={fp.page.id}
            aria-hidden={fp.globalIndex !== index}
          >
            <PageView
              page={fp.page}
              onGoToSection={goToSectionId}
              onGoToPage={goById}
              historyRevealed={
                fp.page.id === current.page.id
                  ? revealedSet
                  : new Set(historyRevealed[fp.page.id] ?? [])
              }
              onHistoryReveal={
                fp.page.id === current.page.id ? revealHistoryYear : undefined
              }
              onHistoryAdvance={
                fp.page.id === current.page.id
                  ? () => go(index + 1)
                  : undefined
              }
              onHistoryJumpYear={
                fp.page.id === current.page.id ? jumpToHistoryYear : undefined
              }
              historyJumpYear={
                fp.page.id === current.page.id ? historyJumpYear : null
              }
              onHistoryJumpYearHandled={
                fp.page.id === current.page.id ? clearHistoryJumpYear : undefined
              }
              historyHint={historyHint && fp.page.id === current.page.id && isHistoryEra}
            />
          </div>
        ))}
      </div>

      {historyCurtain && (
        <div
          className={`history-curtain is-${historyCurtain.phase} is-${historyCurtain.dir}`}
          style={{ background: historyCurtain.color }}
          aria-hidden
        >
          <div className="history-curtain__years">
            {historyCurtain.years.map((year) => (
              <span key={year} className="history-curtain__year">
                {year}
              </span>
            ))}
          </div>
        </div>
      )}

      {missionSlide && (
        <div
          className={`mission-slide is-${missionSlide.phase} is-${missionSlide.dir}`}
          aria-hidden
        />
      )}

      <div className={`reader__chrome${chromeHidden ? ' is-dimmed' : ''}`}>
        <div
          className={`reader__progress${isInterstitial ? ' is-hidden' : ''}`}
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
            {navSections.map((section, i) => {
              const done = navSectionIndex >= 0 && i < navSectionIndex
              const active = i === navSectionIndex
              return (
                <button
                  key={section.id}
                  type="button"
                  className={`reader__progress-node${done ? ' is-done' : ''}${
                    active ? ' is-active' : ''
                  }`}
                  aria-label={`Раздел ${section.number}: ${section.title}`}
                  aria-current={active ? 'step' : undefined}
                  disabled={anyOverlay || zoomPhase !== 'idle' || transitionBusy}
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
              disabled={index === 0 || anyOverlay || zoomPhase !== 'idle' || transitionBusy}
              onClick={() => go(index - 1)}
            >
              ←
            </button>
            <button
              type="button"
              className="nav-arrow nav-arrow--next"
              aria-label="Следующая страница"
              disabled={
                index >= totalPages - 1 || anyOverlay || zoomPhase !== 'idle' || transitionBusy
              }
              onClick={() => go(index + 1)}
            >
              →
            </button>
          </>
        )}

        <div
          className={`reader__pager${
            isInterstitial || isHistoryEra ? ' is-hidden' : ''
          }`}
          aria-live="polite"
        >
          {`${index + 1} / ${totalPages}`}
        </div>

        {hintVisible && !isInterstitial && !isHistoryEra && (
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

      {!isInterstitial && (
        <RollUpMenu
          open={rollOpen}
          onToggle={() => setRollOpen((v) => !v)}
          onClose={() => setRollOpen(false)}
          onContents={() => setTocOpen(true)}
          onHome={onExitToHome}
          onQuotes={() => setQuotesOpen(true)}
        />
      )}

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
