import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
} from 'react'
import { flatPages, navIndexForSectionId, navSections, totalPages } from '../data/book'
import { masteryGalleryPageId, masteryStoryPageIds } from '../data/masteryGallery'
import {
  practiceGalleryPageId,
  practiceStoryPageIds,
} from '../data/practiceGallery'
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
import notebookIcon from '../../icons/notebook-text.svg'
import '../styles/reader.css'
import '../styles/quotes.css'

interface ReaderProps {
  initialIndex?: number
  onExitToHome: () => void
  onBackToWelcome?: () => void
  onPageIndexChange?: (pageIndex: number) => void
}

function labelFor(index: number) {
  const fp = flatPages[index]
  return fp.page.title ?? fp.paragraphTitle
}

const SCROLL_EDGE = 72

function scrollEdges(target: EventTarget | null) {
  const start = target instanceof Element ? target : null
  const page = start?.closest('.reader__page') as HTMLElement | null
  let node: HTMLElement | null = start instanceof HTMLElement ? start : null

  while (node) {
    const overflowY = window.getComputedStyle(node).overflowY
    const scrollable =
      node.scrollHeight > node.clientHeight + 8 &&
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay')
    if (scrollable) {
      const gap = node.scrollHeight - node.scrollTop - node.clientHeight
      return {
        atBottom: gap <= SCROLL_EDGE,
        atTop: node.scrollTop <= SCROLL_EDGE,
        scrollTop: node.scrollTop,
      }
    }
    if (!page || node === page) break
    node = node.parentElement
  }

  return { atBottom: true, atTop: true, scrollTop: page?.scrollTop ?? 0 }
}

function shortPageLabel(pageIndex: number) {
  const raw = labelFor(pageIndex)?.replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim()
  if (!raw) return 'страницу'
  return raw.length > 44 ? `${raw.slice(0, 42)}…` : raw
}

const NAV_COACH_DONE_KEY = 'gph-value-book-nav-coach-done'

function readNavCoachDone() {
  try {
    return localStorage.getItem(NAV_COACH_DONE_KEY) === '1'
  } catch {
    return false
  }
}

function writeNavCoachDone() {
  try {
    localStorage.setItem(NAV_COACH_DONE_KEY, '1')
  } catch {
    /* private mode / blocked storage */
  }
}

export function Reader({
  initialIndex = 0,
  onExitToHome,
  onBackToWelcome,
  onPageIndexChange,
}: ReaderProps) {
  const isMobile = useMediaQuery('(max-width: 860px)')
  const [index, setIndex] = useState(initialIndex)
  const [rollOpen, setRollOpen] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)
  const [quotesOpen, setQuotesOpen] = useState(false)
  const [hintVisible, setHintVisible] = useState(
    () => initialIndex === 0 && !readNavCoachDone(),
  )
  const [coachStep, setCoachStep] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const [selectionUi, setSelectionUi] = useState<{ text: string; x: number; y: number } | null>(
    null,
  )
  const [zoomPhase, setZoomPhase] = useState<'idle' | 'out' | 'in'>('idle')
  const [suppressTrackTransition, setSuppressTrackTransition] = useState(false)
  const [historyRevealed, setHistoryRevealed] = useState<Record<string, number[]>>({})
  const [historyHint, setHistoryHint] = useState(true)
  const [historyJumpYear, setHistoryJumpYear] = useState<string | null>(null)
  const touchStart = useRef<{
    x: number
    y: number
    atBottom: boolean
    atTop: boolean
    scrollTop: number
  } | null>(null)
  const suppressSwipe = useRef(false)
  const wheelLock = useRef(false)
  const swipeLock = useRef(false)
  const swipeLockTimer = useRef(0)
  const zoomTimers = useRef<number[]>([])
  const readerRef = useRef<HTMLElement | null>(null)
  const { quotes, add: addQuote, remove: removeQuote } = useQuotes()

  const current = flatPages[index]
  const isInterstitial = current.page.kind === 'interstitial'
  const isClosingCover = current.page.kind === 'closing-cover'
  const isHistoryEra = current.page.kind === 'history-era'
  const masteryStoryIndex = masteryStoryPageIds.indexOf(current.page.id)
  const isMasteryStory = masteryStoryIndex >= 0
  const hasNextMasteryStory =
    masteryStoryIndex >= 0 && masteryStoryIndex < masteryStoryPageIds.length - 1
  const practiceStoryIndex = practiceStoryPageIds.indexOf(current.page.id)
  const isPracticeStory = practiceStoryIndex >= 0
  const hasNextPracticeStory =
    practiceStoryIndex >= 0 && practiceStoryIndex < practiceStoryPageIds.length - 1
  const showNavCoach = hintVisible && index === 0 && !isInterstitial && !isHistoryEra
  const anyOverlay = rollOpen || tocOpen || quotesOpen || showNavCoach
  const navLocked = rollOpen || tocOpen || quotesOpen
  const chromeHidden =
    isInterstitial ||
    isClosingCover ||
    zoomPhase !== 'idle'

  const prevTooltip = useMemo(() => {
    if (isPracticeStory) return 'К практикам'
    if (isMasteryStory) return 'Вернуться в галерею историй'
    if (index === 0) {
      return onBackToWelcome ? 'К экрану «Добро пожаловать»' : 'Начало книги'
    }
    return `Назад: ${shortPageLabel(index - 1)}`
  }, [isPracticeStory, isMasteryStory, index, onBackToWelcome])

  const nextTooltip = useMemo(() => {
    if (isPracticeStory && hasNextPracticeStory) return 'Следующая практика'
    if (isMasteryStory && hasNextMasteryStory) return 'К следующей истории'
    if (index >= totalPages - 1) return 'Конец книги'
    return `Далее: ${shortPageLabel(index + 1)}`
  }, [
    isPracticeStory,
    hasNextPracticeStory,
    isMasteryStory,
    hasNextMasteryStory,
    index,
  ])
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

  useEffect(
    () => () => {
      clearZoomTimers()
    },
    [clearZoomTimers],
  )

  useEffect(() => {
    setIndex(Math.min(Math.max(initialIndex, 0), totalPages - 1))
  }, [initialIndex])

  useEffect(() => {
    onPageIndexChange?.(index)
  }, [index, onPageIndexChange])

  useEffect(() => {
    if (index !== 0) {
      setHintVisible(false)
      return
    }
    if (readNavCoachDone()) {
      setHintVisible(false)
      return
    }
    setHintVisible(true)
    setCoachStep(0)
  }, [index])

  const dismissHint = useCallback(() => {
    writeNavCoachDone()
    setHintVisible(false)
    setCoachStep(0)
  }, [])

  const coachSteps = useMemo(
    () => {
      type CoachParagraph = { text: string; bold?: boolean; accent?: boolean }
      type CoachStep = {
        id: string
        placement: 'center' | 'menu'
        title: string
        paragraphs: CoachParagraph[]
        showNotesPreview: boolean
        ctaHint: string | null
      }

      const steps: CoachStep[] = [
        {
          id: 'nav',
          placement: 'center',
          title: 'Навигация по книге',
          paragraphs: [
            {
              text: 'Для продолжения чтения – листайте свайпом вверх/вниз или используйте стрелки вперёд/назад.',
            },
            {
              text: 'Для открытия нужного раздела — используйте нумерацию наверху.',
            },
            { text: 'Нажми кнопку «Далее»', accent: true },
          ],
          showNotesPreview: false,
          ctaHint: null,
        },
        {
          id: 'menu',
          placement: 'menu',
          title: 'Меню',
          paragraphs: [
            {
              text: 'Здесь содержание книги и твои заметки. Отсюда можно попасть в начало книги или на главную страницу.',
            },
            { text: 'Как сделать заметку:', bold: true },
            {
              text: 'выдели текст на странице – появится кнопка\nс блокнотом – нажми её, чтобы сохранить фрагмент в заметки.',
            },
          ],
          showNotesPreview: true,
          ctaHint: 'Нажми кнопку «Понятно»',
        },
      ]
      return steps
    },
    [],
  )

  const coachCurrent = coachSteps[Math.min(coachStep, coachSteps.length - 1)]
  const coachIsLast = coachStep >= coachSteps.length - 1

  const advanceCoach = useCallback(() => {
    if (coachIsLast) {
      dismissHint()
      return
    }
    setCoachStep((s) => s + 1)
  }, [coachIsLast, dismissHint])

  useEffect(() => {
    if (!showNavCoach) return
    const btn = document.querySelector<HTMLButtonElement>('.reader__nav-coach-ok')
    btn?.focus()
  }, [showNavCoach, coachStep])

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
      if (zoomPhase !== 'idle') return
      if (clamped === index) return

      // History: reveal year cards before advancing, except on the phone
      // layout where every card of the page is already on screen.
      const historyPhone =
        typeof window !== 'undefined' &&
        window.matchMedia('(max-width: 768px)').matches
      if (
        !opts?.force &&
        !historyPhone &&
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

      // History pages: hard cut, no horizontal slide
      if (historyToHistory) {
        setSuppressTrackTransition(true)
        setIndex(clamped)
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => setSuppressTrackTransition(false))
        })
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
      isMobile,
      clearZoomTimers,
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

  useLayoutEffect(() => {
    const kind = flatPages[index]?.page.kind
    const opensAtStart =
      kind === 'mastery-semavic' ||
      kind === 'mastery-venezuela' ||
      kind === 'mastery-third-line' ||
      kind === 'mastery-putin' ||
      kind === 'env-navigator' ||
      kind === 'practice-gallery'
    if (!opensAtStart) return

    const root = readerRef.current
    if (!root) return
    const active = document.activeElement
    if (active instanceof HTMLElement && root.contains(active)) active.blur()

    const page = root.querySelectorAll<HTMLElement>('.reader__page')[index]
    if (!page) return
    const snap = () => {
      page.scrollTop = 0
      page
        .querySelectorAll<HTMLElement>(
          '.ms__left-inner, .ms__right-inner, .ms__col-story, .ms__col-values, .en__inner',
        )
        .forEach((el) => {
          el.scrollTop = 0
        })
    }
    snap()
    const raf = requestAnimationFrame(snap)
    return () => cancelAnimationFrame(raf)
  }, [index])

  useLayoutEffect(() => {
    if (!isMobile) return
    const root = readerRef.current
    if (!root) return
    const page = root.querySelectorAll<HTMLElement>('.reader__page')[index]
    if (!page) return
    page.scrollTop = 0
  }, [index, isMobile])

  const goById = useCallback(
    (pageId: string) => {
      const found = flatPages.findIndex((p) => p.page.id === pageId)
      if (found >= 0) go(found)
    },
    [go],
  )

  const navigatePrev = useCallback(() => {
    if (showNavCoach) return
    if (isMasteryStory) {
      goById(masteryGalleryPageId)
      return
    }
    if (isPracticeStory) {
      goById(practiceGalleryPageId)
      return
    }
    if (index === 0) {
      onBackToWelcome?.()
      return
    }
    go(index - 1)
  }, [showNavCoach, isMasteryStory, isPracticeStory, goById, index, onBackToWelcome, go])

  const navigateNext = useCallback(() => {
    if (showNavCoach) return
    if (isMasteryStory) {
      if (hasNextMasteryStory) {
        goById(masteryStoryPageIds[masteryStoryIndex + 1])
        return
      }
      go(index + 1)
      return
    }
    if (isPracticeStory) {
      if (hasNextPracticeStory) {
        goById(practiceStoryPageIds[practiceStoryIndex + 1])
        return
      }
      go(index + 1)
      return
    }
    go(index + 1)
  }, [
    isMasteryStory,
    hasNextMasteryStory,
    masteryStoryIndex,
    isPracticeStory,
    hasNextPracticeStory,
    practiceStoryIndex,
    goById,
    index,
    go,
    showNavCoach,
  ])

  const goToSection = useCallback(
    (sectionIndex: number) => {
      const section = navSections[sectionIndex]
      if (!section) return
      const firstPage = section.paragraphs[0]?.pages[0]
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
      if (anyOverlay || zoomPhase !== 'idle') return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        navigateNext()
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        navigatePrev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigateNext, navigatePrev, anyOverlay, zoomPhase])

  useEffect(() => {
    if (isMobile) return
    const root = readerRef.current
    if (!root) return

    const canScrollFurther = (el: HTMLElement, deltaY: number) => {
      const style = window.getComputedStyle(el)
      const overflowY = style.overflowY
      if (overflowY !== 'auto' && overflowY !== 'scroll' && overflowY !== 'overlay') {
        return false
      }
      if (el.scrollHeight <= el.clientHeight + 2) return false
      if (deltaY > 0) return el.scrollTop + el.clientHeight < el.scrollHeight - 2
      if (deltaY < 0) return el.scrollTop > 2
      return false
    }

    const onWheel = (e: WheelEvent) => {
      if (anyOverlay || zoomPhase !== 'idle') return
      if (Math.abs(e.deltaY) < 8 && Math.abs(e.deltaX) < 8) return

      let node = e.target as HTMLElement | null
      while (node && node !== root) {
        if (canScrollFurther(node, e.deltaY)) return
        node = node.parentElement
      }

      // Strategy house / practice gallery: wheel drives local UI, never flips pages.
      const pageKind = flatPages[index]?.page.kind
      if (pageKind === 'mission-strategy-house' || pageKind === 'practice-gallery') {
        e.preventDefault()
        return
      }

      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      if (delta === 0) return

      e.preventDefault()
      if (wheelLock.current) return
      wheelLock.current = true
      window.setTimeout(() => {
        wheelLock.current = false
      }, 520)

      if (delta > 0) navigateNext()
      else navigatePrev()
    }

    root.addEventListener('wheel', onWheel, { passive: false })
    return () => root.removeEventListener('wheel', onWheel)
  }, [
    navigateNext,
    navigatePrev,
    anyOverlay,
    zoomPhase,
    isMobile,
    flatPages,
    index,
  ])

  const armSwipeLock = () => {
    swipeLock.current = true
    window.clearTimeout(swipeLockTimer.current)
    swipeLockTimer.current = window.setTimeout(() => {
      swipeLock.current = false
    }, 1100)
  }

  const onTouchStart = (e: TouchEvent) => {
    const target = e.target
    if (
      target instanceof Element &&
      target.closest('.menu-overlay, .quotes-overlay, .roll-menu')
    ) {
      touchStart.current = null
      return
    }
    if (swipeLock.current) {
      touchStart.current = null
      return
    }
    const t = e.changedTouches[0]
    const edges = scrollEdges(e.target)
    touchStart.current = {
      x: t.clientX,
      y: t.clientY,
      atBottom: edges.atBottom,
      atTop: edges.atTop,
      scrollTop: edges.scrollTop,
    }
  }

  const onTouchEnd = (e: TouchEvent) => {
    if (
      !touchStart.current ||
      swipeLock.current ||
      anyOverlay ||
      suppressSwipe.current ||
      zoomPhase !== 'idle'
    ) {
      suppressSwipe.current = false
      touchStart.current = null
      return
    }
    const t = e.changedTouches[0]
    const startedAtBottom = touchStart.current.atBottom
    const startedAtTop = touchStart.current.atTop
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    touchStart.current = null
    const turn = (dir: 'next' | 'prev') => {
      armSwipeLock()
      if (dir === 'next') navigateNext()
      else navigatePrev()
    }
    if (isMobile) {
      const threshold = 56
      const fingerUp = dy < -threshold && Math.abs(dy) > Math.abs(dx)
      const fingerDown = dy > threshold && Math.abs(dy) > Math.abs(dx)
      if (fingerUp && startedAtBottom) turn('next')
      else if (fingerDown && startedAtTop) turn('prev')
    } else if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) {
      if (dx < 0) turn('next')
      else turn('prev')
    }
  }

  useEffect(() => {
    if (!isMobile) return
    const root = readerRef.current
    if (!root) return
    const onMove = (e: globalThis.TouchEvent) => {
      const target = e.target
      if (
        target instanceof Element &&
        target.closest('.menu-overlay, .quotes-overlay, .roll-menu')
      ) {
        return
      }
      const start = touchStart.current
      if (!start || swipeLock.current) return
      const t = e.touches[0]
      if (!t) return
      const dy = t.clientY - start.y
      const dx = t.clientX - start.x
      if (Math.abs(dy) < 10 || Math.abs(dy) <= Math.abs(dx)) return
      if ((dy < 0 && start.atBottom) || (dy > 0 && start.atTop)) {
        e.preventDefault()
      }
    }
    root.addEventListener('touchmove', onMove, { passive: false })
    return () => root.removeEventListener('touchmove', onMove)
  }, [isMobile])

  const trackStyle = useMemo(() => {
    const transform = isMobile
      ? `translate3d(0, ${-index * 100}%, 0)`
      : `translate3d(${-index * 100}%, 0, 0)`
    return {
      transform,
      transition:
        zoomPhase !== 'idle' || suppressTrackTransition ? 'none' : undefined,
    }
  }, [index, isMobile, zoomPhase, suppressTrackTransition])

  const handleAddQuote = () => {
    if (!selectionUi) return
    const ok = addQuote(selectionUi.text, current.page.id, labelFor(index))
    setToast(ok ? 'Добавлено в заметки' : 'Эта заметка уже сохранена')
    setSelectionUi(null)
    window.getSelection()?.removeAllRanges()
  }

  return (
    <section
      ref={readerRef}
      className={`reader${isMobile ? ' is-vertical' : ''}${
        zoomPhase === 'out' ? ' is-zoom-out' : ''
      }${zoomPhase === 'in' ? ' is-zoom-in' : ''}${isInterstitial ? ' is-interstitial' : ''}${
        isHistoryEra ? ' is-history' : ''
      }${showNavCoach ? ` is-coaching is-coaching-step-${coachCurrent.placement}` : ''}`}
      aria-label="Чтение книги"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
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
              onHistoryRetreat={
                fp.page.id === current.page.id ? navigatePrev : undefined
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

      {showNavCoach && (
        <>
          <div className="reader__nav-coach-backdrop" aria-hidden />
          <div
            className={`reader__nav-coach reader__nav-coach--${coachCurrent.placement}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reader-nav-coach-title"
          >
            <p className="reader__nav-coach-title" id="reader-nav-coach-title">
              {coachCurrent.title}
            </p>
            {coachCurrent.paragraphs.map((paragraph) => (
              <p
                key={paragraph.text}
                className={`reader__nav-coach-text${paragraph.bold ? ' is-bold' : ''}${
                  paragraph.accent ? ' is-accent' : ''
                }`}
              >
                {paragraph.text}
              </p>
            ))}
            {coachCurrent.showNotesPreview && (
              <p className="reader__nav-coach-preview">
                <span className="quote-pop quote-pop--static" aria-hidden>
                  <img src={notebookIcon} alt="" width={22} height={22} />
                </span>
                Добавить в заметки
              </p>
            )}
            {coachCurrent.ctaHint && (
              <p className="reader__nav-coach-text is-accent">{coachCurrent.ctaHint}</p>
            )}
            <div className="reader__nav-coach-actions">
              <span className="reader__nav-coach-step" aria-hidden>
                {coachStep + 1} / {coachSteps.length}
              </span>
              <button
                type="button"
                className="reader__nav-coach-ok"
                onClick={advanceCoach}
              >
                {coachIsLast ? 'Понятно' : 'Далее'}
              </button>
            </div>
          </div>
        </>
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
                  title={section.title}
                  data-tooltip={section.title}
                  disabled={navLocked || zoomPhase !== 'idle'}
                  onClick={() => {
                    if (showNavCoach) return
                    goToSection(i)
                  }}
                >
                  {Number(section.number) || i + 1}
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          className="nav-arrow nav-arrow--prev"
          aria-label={prevTooltip}
          title={prevTooltip}
          data-tooltip={prevTooltip}
          disabled={
            (!isMasteryStory && !isPracticeStory && index === 0 && !onBackToWelcome) ||
            navLocked ||
            zoomPhase !== 'idle'
          }
          onClick={navigatePrev}
        >
          ←
        </button>
        <button
          type="button"
          className="nav-arrow nav-arrow--next"
          aria-label={nextTooltip}
          title={nextTooltip}
          data-tooltip={nextTooltip}
          disabled={
            index >= totalPages - 1 || navLocked || zoomPhase !== 'idle'
          }
          onClick={navigateNext}
        >
          →
        </button>

        <div
          className={`reader__pager${
            isInterstitial || isHistoryEra ? ' is-hidden' : ''
          }`}
          aria-live="polite"
        >
          {`${index + 1} / ${totalPages}`}
        </div>

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
          aria-label="Добавить в заметки"
          title="Добавить в заметки"
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={() => {
            suppressSwipe.current = true
          }}
          onClick={handleAddQuote}
        >
          <img src={notebookIcon} alt="" width={22} height={22} />
        </button>
      )}

      {!isInterstitial && (
        <RollUpMenu
          open={rollOpen}
          onToggle={() => setRollOpen((v) => !v)}
          onClose={() => setRollOpen(false)}
          onContents={() => setTocOpen(true)}
          onBookStart={() => go(0)}
          onCover={onExitToHome}
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
