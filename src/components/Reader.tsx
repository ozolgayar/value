import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
} from 'react'
import {
  flatPages,
  navIndexForSectionId,
  navSections,
  totalPages,
  type PageKind,
} from '../data/book'
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
import { asset } from '../asset'
import { BentoMenu } from './BentoMenu'
import { PageView } from './PageView'
import { QuotesPanel } from './QuotesPanel'
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

/** White page counter when it sits on a colored / dark page surface. */
function pagerNeedsWhite(kind: PageKind): boolean {
  switch (kind) {
    case 'ceo':
    case 'text':
    case 'split':
    case 'route':
    case 'section-open':
    case 'facts':
    case 'quote':
    case 'timeline':
    case 'values':
    case 'values-spread':
    case 'value-ambition':
    case 'value-passion':
    case 'value-responsibility':
    case 'mission-ecosystem':
    case 'mission-eco':
    case 'mission-longevity':
    case 'mastery-gallery':
    case 'mastery-semavic':
    case 'mastery-venezuela':
    case 'mastery-third-line':
    case 'mastery-putin':
    case 'practice-gallery':
    case 'practice-equipment':
    case 'practice-weeks':
    case 'practice-error-first':
    case 'practice-market':
    case 'practice-modernization':
    case 'practice-ai':
    case 'practice-long-term':
    case 'practice-methodology':
    case 'practice-bureaucracy':
    case 'practice-habits':
    case 'history-era':
      return false
    case 'interstitial':
    case 'mission-statement':
    case 'mission-strategy-spread':
    case 'mission-strategy-house':
    case 'mission-uniqueness':
    case 'mission-we-brand':
    case 'env-navigator':
    case 'culture-bingo':
    case 'closing-cover':
      return true
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

const NAV_COACH_DONE_KEY = 'gph-value-book-nav-coach-done-v2'

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
  const [tocOpen, setTocOpen] = useState(false)
  const [quotesOpen, setQuotesOpen] = useState(false)
  const [hintVisible, setHintVisible] = useState(
    () => initialIndex === 0 && !readNavCoachDone(),
  )
  const [coachStep, setCoachStep] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const [selectionUi, setSelectionUi] = useState<{
    text: string
    x: number
    y: number
  } | null>(null)
  const [chromeAway, setChromeAway] = useState(false)
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
    target: EventTarget | null
  } | null>(null)
  const wheelLock = useRef(false)
  const swipeLock = useRef(false)
  const swipeLockTimer = useRef(0)
  const sectionEndToastAt = useRef(0)
  const zoomTimers = useRef<number[]>([])
  const readerRef = useRef<HTMLElement | null>(null)
  const pendingSelection = useRef<{ text: string; x: number; y: number } | null>(null)
  const { quotes, add: addQuote, remove: removeQuote } = useQuotes()

  const current = flatPages[index]
  const isInterstitial = current.page.kind === 'interstitial'
  const isClosingCover = current.page.kind === 'closing-cover'
  const isHistoryEra = current.page.kind === 'history-era'
  const masteryStoryIndex = masteryStoryPageIds.indexOf(current.page.id)
  const isMasteryStory = masteryStoryIndex >= 0
  const practiceStoryIndex = practiceStoryPageIds.indexOf(current.page.id)
  const isPracticeStory = practiceStoryIndex >= 0
  const showNavCoach = hintVisible && index === 0 && !isInterstitial && !isHistoryEra
  const anyOverlay = tocOpen || quotesOpen || showNavCoach
  const navLocked = tocOpen || quotesOpen
  const notebookIconUrl = asset('icons/notebook-text.svg')
  const chromeHidden =
    isInterstitial ||
    isClosingCover ||
    zoomPhase !== 'idle'
  const chromeImmersive = isMobile && chromeAway && !chromeHidden && !anyOverlay

  const prevTooltip = useMemo(() => {
    if (isPracticeStory) return 'К практикам'
    if (isMasteryStory) return 'Вернуться в галерею историй'
    if (index === 0) {
      return onBackToWelcome ? 'К экрану «Добро пожаловать»' : 'Начало книги'
    }
    return `Назад: ${shortPageLabel(index - 1)}`
  }, [isPracticeStory, isMasteryStory, index, onBackToWelcome])

  const nextAfterMasteryStories = useMemo(() => {
    if (!isMasteryStory) return -1
    return flatPages.findIndex(
      (fp, i) => i > index && !masteryStoryPageIds.includes(fp.page.id),
    )
  }, [isMasteryStory, index])

  const nextAfterPracticeStories = useMemo(() => {
    if (!isPracticeStory) return -1
    return flatPages.findIndex(
      (fp, i) => i > index && !practiceStoryPageIds.includes(fp.page.id),
    )
  }, [isPracticeStory, index])

  const nextTooltip = useMemo(() => {
    if (isPracticeStory) {
      if (nextAfterPracticeStories >= 0) {
        return `Далее: ${shortPageLabel(nextAfterPracticeStories)}`
      }
      return 'Конец книги'
    }
    if (isMasteryStory) {
      if (nextAfterMasteryStories >= 0) {
        return `Далее: ${shortPageLabel(nextAfterMasteryStories)}`
      }
      return 'Конец книги'
    }
    if (index >= totalPages - 1) return 'Конец книги'
    return `Далее: ${shortPageLabel(index + 1)}`
  }, [
    isPracticeStory,
    nextAfterPracticeStories,
    isMasteryStory,
    nextAfterMasteryStories,
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
  const currentNavSection =
    navSectionIndex >= 0 ? navSections[navSectionIndex] : null
  const sectionTitleLabel = useMemo(() => {
    if (current.page.kind === 'culture-bingo') return 'Игра · Культурное бинго'
    if (!currentNavSection) return current.paragraphTitle || 'Раздел'
    const num = Number(currentNavSection.number) || navSectionIndex + 1
    return `Раздел ${num} · ${currentNavSection.title}`
  }, [current.page.kind, currentNavSection, current.paragraphTitle, navSectionIndex])
  const goHome = useCallback(() => {
    if (onBackToWelcome) onBackToWelcome()
    else onExitToHome()
  }, [onBackToWelcome, onExitToHome])
  const hintSectionEnd = useCallback(() => {
    const now = Date.now()
    if (now - sectionEndToastAt.current < 1800) return
    sectionEndToastAt.current = now
    // Interstitials have no section buttons — swipe-only hint.
    const onInterstitial =
      flatPages[index]?.page.kind === 'interstitial'
    setToast(
      onInterstitial
        ? 'Свайп влево — следующий раздел,\nсвайп вправо — предыдущий раздел'
        : 'Конец раздела — свайпни вбок\nили воспользуйся кнопками',
    )
  }, [flatPages, index])

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
      type CoachParagraph = {
        text: string
        boldLead?: string
        boldLeadTone?: 'notes'
        bold?: boolean
        accent?: boolean
        label?: string
      }
      type CoachStep = {
        id: string
        placement: 'center' | 'topbar'
        title: string
        paragraphs: CoachParagraph[]
        ctaHint: string | null
      }

      const navStep: CoachStep = isMobile
        ? {
            id: 'nav',
            placement: 'center',
            title: 'Навигация по книге',
            paragraphs: [
              {
                text: 'Внутри раздела листайте свайпом вверх/вниз. К следующему разделу — свайпом вбок.',
              },
              {
                text: 'На телефоне коснитесь экрана, чтобы скрыть или показать панель навигации.',
              },
            ],
            ctaHint: 'Нажми кнопку «Далее»',
          }
        : {
            id: 'nav',
            placement: 'center',
            title: 'Навигация по книге',
            paragraphs: [
              {
                text: 'Для продолжения чтения листайте стрелками вперёд/назад.',
              },
              { text: 'Нажми кнопку «Далее»', accent: true },
            ],
            ctaHint: null,
          }

      const chromeStep: CoachStep = {
        id: 'chrome',
        placement: 'topbar',
        title: 'Панель навигации',
        paragraphs: [
          {
            label: 'Домой',
            text: '— возврат на экран «Добро пожаловать».',
          },
          {
            label: 'Раздел 1 · О книге',
            text: '— название текущего раздела.',
          },
          {
            label: 'Меню',
            text: '— здесь оглавление книги и твои заметки.',
          },
          {
            boldLead: 'Как сделать заметку',
            boldLeadTone: 'notes',
            text: ': выдели текст на странице – появится кнопка с блокнотом – нажми её, чтобы сохранить фрагмент в заметки.',
          },
        ],
        ctaHint: 'Нажми кнопку «Понятно»',
      }

      return [navStep, chromeStep]
    },
    [isMobile],
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
    const t = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(t)
  }, [toast])

  useEffect(() => {
    if (!isMobile) setChromeAway(false)
  }, [isMobile])

  // Keep the bottom page counter pinned; never leave chrome-away mid-transition.
  useEffect(() => {
    setChromeAway(false)
  }, [index])

  useEffect(() => {
    if (!isMobile || !isInterstitial) return
    const now = Date.now()
    if (now - sectionEndToastAt.current < 1800) return
    sectionEndToastAt.current = now
    setToast('Свайп влево — следующий раздел,\nсвайп вправо — предыдущий раздел')
  }, [index, isInterstitial, isMobile])

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
      const pageYears =
        getHistoryPage(pageIndex)?.years.length ?? yearOnPage + 1
      setHistoryRevealed((prev) => {
        const cur = new Set(prev[pageId] ?? [])
        for (let i = 0; i < pageYears; i++) cur.add(i)
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

  const isGalleryPickPage =
    current.page.kind === 'mastery-gallery' ||
    current.page.kind === 'practice-gallery'

  const navigateNext = useCallback(() => {
    if (showNavCoach) return
    // Gallery: user must pick a card — do not advance by swipe/arrow.
    if (
      current.page.kind === 'mastery-gallery' ||
      current.page.kind === 'practice-gallery'
    ) {
      return
    }
    if (isMasteryStory) {
      // After a chosen story — next section, not the next gallery story.
      if (nextAfterMasteryStories >= 0) {
        go(nextAfterMasteryStories)
        return
      }
      return
    }
    if (isPracticeStory) {
      // After a chosen practice — next section, not the next gallery case.
      if (nextAfterPracticeStories >= 0) {
        go(nextAfterPracticeStories)
        return
      }
      return
    }
    go(index + 1)
  }, [
    current.page.kind,
    isMasteryStory,
    nextAfterMasteryStories,
    isPracticeStory,
    nextAfterPracticeStories,
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

  const goNextSection = useCallback(() => {
    if (navSectionIndex < 0) {
      const next = flatPages[index + 1]
      if (next) go(index + 1)
      return
    }
    if (navSectionIndex < sectionCount - 1) {
      goToSection(navSectionIndex + 1)
      return
    }
    // Last nav section: still allow reaching trailing pages (e.g. closing cover).
    if (index < totalPages - 1) go(index + 1)
  }, [navSectionIndex, sectionCount, goToSection, index, go])

  const goPrevSection = useCallback(() => {
    if (navSectionIndex > 0) {
      goToSection(navSectionIndex - 1)
      return
    }
    if (navSectionIndex === 0 || index === 0) {
      onBackToWelcome?.()
      return
    }
    const prev = flatPages[index - 1]
    if (prev) go(index - 1)
  }, [navSectionIndex, goToSection, index, onBackToWelcome, go])

  const pageStaysInSection = useCallback((targetIndex: number) => {
    const target = flatPages[targetIndex]
    if (!target) return false
    return target.sectionId === flatPages[index]?.sectionId
  }, [index])

  useEffect(() => {
    const readSelection = () => {
      if (anyOverlay) {
        pendingSelection.current = null
        setSelectionUi(null)
        return null
      }
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        pendingSelection.current = null
        setSelectionUi(null)
        return null
      }
      const text = sel.toString().replace(/\s+/g, ' ').trim()
      if (text.length < 2) {
        pendingSelection.current = null
        setSelectionUi(null)
        return null
      }
      const range = sel.getRangeAt(0)
      const readerRoot = readerRef.current
      if (!readerRoot || !readerRoot.contains(range.commonAncestorContainer)) {
        pendingSelection.current = null
        setSelectionUi(null)
        return null
      }
      const rect = range.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) {
        pendingSelection.current = null
        setSelectionUi(null)
        return null
      }
      const next = {
        text,
        x: rect.left + rect.width / 2,
        y: Math.max(rect.top, 48),
      }
      pendingSelection.current = next
      return next
    }

    const publishDesktop = () => {
      if (isMobile) return
      const next = readSelection()
      if (next) setSelectionUi(next)
    }

    const publishMobile = () => {
      if (!isMobile) return
      const next = pendingSelection.current ?? readSelection()
      if (next) setSelectionUi(next)
    }

    const onSelectionChange = () => {
      const next = readSelection()
      // Desktop: show near selection immediately.
      // Mobile: keep pending until finger lifts, so we don't fight the system menu mid-drag.
      if (!isMobile && next) setSelectionUi(next)
    }

    document.addEventListener('selectionchange', onSelectionChange)
    document.addEventListener('mouseup', publishDesktop)
    document.addEventListener('keyup', publishDesktop)
    document.addEventListener('touchend', publishMobile)
    document.addEventListener('touchcancel', publishMobile)
    return () => {
      document.removeEventListener('selectionchange', onSelectionChange)
      document.removeEventListener('mouseup', publishDesktop)
      document.removeEventListener('keyup', publishDesktop)
      document.removeEventListener('touchend', publishMobile)
      document.removeEventListener('touchcancel', publishMobile)
    }
  }, [anyOverlay, isMobile])

  const handleAddQuote = useCallback(() => {
    if (!selectionUi) return
    const ok = addQuote(selectionUi.text, current.page.id, labelFor(index))
    setToast(ok ? 'Добавлено в заметки' : 'Эта заметка уже сохранена')
    setSelectionUi(null)
    pendingSelection.current = null
    window.getSelection()?.removeAllRanges()
  }, [selectionUi, addQuote, current.page.id, index])

  useEffect(() => {
    setSelectionUi(null)
    pendingSelection.current = null
  }, [index])

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

      // Local interactive wheels: never flip pages.
      const pageKind = flatPages[index]?.page.kind
      if (
        pageKind === 'mission-strategy-house' ||
        pageKind === 'practice-gallery' ||
        pageKind === 'mission-ecosystem'
      ) {
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
      target.closest(
        '.menu-overlay, .reader__topbar, .reader__nav-coach, .nav-arrow, .tlh__chips, .tlh__chip, .tlh__period-nav, .shouse__mobile-floors, .shouse__floor-stepper, .shouse__floor-step-btn, .shouse__hotspot',
      )
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
      target: e.target,
    }
  }

  const onTouchEnd = (e: TouchEvent) => {
    if (
      !touchStart.current ||
      swipeLock.current ||
      anyOverlay ||
      zoomPhase !== 'idle'
    ) {
      touchStart.current = null
      return
    }
    const t = e.changedTouches[0]
    const startedAtBottom = touchStart.current.atBottom
    const startedAtTop = touchStart.current.atTop
    const startTarget = touchStart.current.target
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
      const tapSlop = 12
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      const fingerUp = dy < -threshold && absDy > absDx
      const fingerDown = dy > threshold && absDy > absDx
      const fingerLeft = dx < -threshold && absDx > absDy
      const fingerRight = dx > threshold && absDx > absDy
      const isTap = absDx < tapSlop && absDy < tapSlop

      if (fingerLeft) {
        armSwipeLock()
        goNextSection()
        return
      }
      if (fingerRight) {
        armSwipeLock()
        goPrevSection()
        return
      }
      if (fingerUp && startedAtBottom) {
        // Gallery: must pick a story/practice — no swipe-to-next.
        if (isGalleryPickPage) return
        // Vertical swipe only flips pages inside the same section.
        if (pageStaysInSection(index + 1)) {
          turn('next')
        } else {
          hintSectionEnd()
        }
        return
      }
      if (fingerDown && startedAtTop) {
        if (pageStaysInSection(index - 1)) turn('prev')
        return
      }
      if (isTap) {
        const el = startTarget instanceof Element ? startTarget : null
        if (
          el?.closest(
            'button, a, input, textarea, select, label, .menu-overlay, .reader__topbar, .reader__nav-coach, .nav-arrow, [role="button"]',
          )
        ) {
          return
        }
        setChromeAway((v) => !v)
      }
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
        target.closest(
          '.menu-overlay, .reader__topbar, .reader__nav-coach, .tlh__chips, .tlh__chip, .tlh__period-nav, .shouse__mobile-floors, .shouse__floor-stepper, .shouse__floor-step-btn, .shouse__hotspot',
        )
      ) {
        return
      }
      const start = touchStart.current
      if (!start || swipeLock.current) return
      const t = e.touches[0]
      if (!t) return
      const dy = t.clientY - start.y
      const dx = t.clientX - start.x
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (absDx > 10 && absDx > absDy) {
        e.preventDefault()
        return
      }
      if (absDy < 10 || absDy <= absDx) return
      if (dy < 0 && start.atBottom) {
        e.preventDefault()
        return
      }
      if (dy > 0 && start.atTop) {
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

  return (
    <section
      ref={readerRef}
      className={`reader${isMobile ? ' is-vertical' : ''}${
        zoomPhase === 'out' ? ' is-zoom-out' : ''
      }${zoomPhase === 'in' ? ' is-zoom-in' : ''}${isInterstitial ? ' is-interstitial' : ''}${
        isHistoryEra ? ' is-history' : ''
      }${chromeImmersive ? ' is-chrome-away' : ''}${
        pagerNeedsWhite(current.page.kind) ? ' is-pager-on-color' : ''
      }${showNavCoach ? ` is-coaching is-coaching-step-${coachCurrent.placement}` : ''}`}
      aria-label="Чтение книги"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <div className="reader__track" style={trackStyle} key={`track-${totalPages}`}>
        {flatPages.map((fp) => {
          // Mount only nearby pages — full book mount crashes mobile/GitHub Pages tabs
          // after history grew to many heavy chapter screens.
          const nearby = Math.abs(fp.globalIndex - index) <= 1
          return (
            <div
              className="reader__page"
              key={fp.page.id}
              aria-hidden={fp.globalIndex !== index}
            >
              {nearby ? (
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
                    fp.page.id === current.page.id
                      ? clearHistoryJumpYear
                      : undefined
                  }
                  historyHint={
                    historyHint && fp.page.id === current.page.id && isHistoryEra
                  }
                  sectionEndNav={
                    isMobile &&
                    fp.globalIndex === index &&
                    fp.page.kind !== 'interstitial' &&
                    fp.page.kind !== 'closing-cover' &&
                    fp.page.kind !== 'culture-bingo' &&
                    !practiceStoryPageIds.includes(fp.page.id) &&
                    (masteryStoryPageIds.includes(fp.page.id) ||
                      fp.sectionPageIndex === fp.sectionPageCount - 1) ? (
                      <nav
                        className="reader__section-end-nav"
                        aria-label="Навигация по разделам"
                      >
                        <button
                          type="button"
                          className="reader__section-end-btn"
                          disabled={
                            navLocked ||
                            zoomPhase !== 'idle' ||
                            (navSectionIndex <= 0 &&
                              !onBackToWelcome &&
                              index === 0)
                          }
                          onClick={goPrevSection}
                        >
                          Предыдущий раздел
                        </button>
                        <button
                          type="button"
                          className="reader__section-end-btn reader__section-end-btn--next"
                          disabled={
                            navLocked ||
                            zoomPhase !== 'idle' ||
                            index >= totalPages - 1
                          }
                          onClick={goNextSection}
                        >
                          Следующий раздел
                        </button>
                      </nav>
                    ) : null
                  }
                />
              ) : null}
            </div>
          )
        })}
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
                key={`${paragraph.label ?? paragraph.boldLead ?? 'text'}-${paragraph.text}`}
                className={`reader__nav-coach-text${
                  paragraph.label ? (isMobile ? ' is-stack' : ' has-label') : ''
                }${paragraph.bold ? ' is-bold' : ''}${
                  paragraph.accent ? ' is-accent' : ''
                }`}
              >
                {paragraph.label ? (
                  <span className="reader__nav-coach-label">{paragraph.label}</span>
                ) : null}
                <span className="reader__nav-coach-desc">
                  {paragraph.boldLead ? (
                    <strong
                      className={`reader__nav-coach-label${
                        paragraph.boldLeadTone === 'notes'
                          ? ' reader__nav-coach-label--notes'
                          : ''
                      }`}
                    >
                      {paragraph.boldLead}
                    </strong>
                  ) : null}
                  {paragraph.text}
                </span>
              </p>
            ))}
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
          className={`reader__topbar${isInterstitial ? ' is-hidden' : ''}`}
          role="navigation"
          aria-label="Навигация по книге"
        >
          <button
            type="button"
            className="reader__topbar-home"
            aria-label="На экран «Добро пожаловать»"
            title="Добро пожаловать"
            disabled={navLocked || zoomPhase !== 'idle'}
            onClick={() => {
              if (showNavCoach) return
              goHome()
            }}
          >
            <img
              src={asset('icons/house.svg')}
              alt=""
              width={22}
              height={22}
              aria-hidden
            />
          </button>

          <p className="reader__topbar-title" aria-live="polite">
            {sectionTitleLabel}
          </p>

          <button
            type="button"
            className="reader__topbar-menu"
            aria-label="Открыть оглавление"
            aria-expanded={tocOpen}
            title="Оглавление"
            disabled={navLocked || zoomPhase !== 'idle'}
            onClick={() => {
              if (showNavCoach) return
              setTocOpen(true)
            }}
          >
            <span className="reader__topbar-burger" aria-hidden>
              <span />
              <span />
              <span />
            </span>
          </button>
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
            isGalleryPickPage ||
            index >= totalPages - 1 ||
            navLocked ||
            zoomPhase !== 'idle'
          }
          onClick={navigateNext}
        >
          →
        </button>

        <div
          className={`reader__pager${isInterstitial ? ' is-hidden' : ''}`}
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

      {selectionUi && !isMobile && (
        <button
          type="button"
          className="quote-pop"
          style={{ left: selectionUi.x, top: selectionUi.y }}
          aria-label="Добавить в заметки"
          title="Добавить в заметки"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleAddQuote}
        >
          <span
            className="quote-pop__icon"
            style={{
              WebkitMaskImage: `url(${notebookIconUrl})`,
              maskImage: `url(${notebookIconUrl})`,
            }}
            aria-hidden
          />
        </button>
      )}

      {selectionUi && isMobile && (
        <button
          type="button"
          className="quote-dock"
          aria-label="Добавить в заметки"
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={handleAddQuote}
        >
          <span
            className="quote-dock__icon"
            style={{
              WebkitMaskImage: `url(${notebookIconUrl})`,
              maskImage: `url(${notebookIconUrl})`,
            }}
            aria-hidden
          />
          <span>Добавить в заметки</span>
        </button>
      )}

      <BentoMenu
        open={tocOpen}
        current={current}
        onClose={() => setTocOpen(false)}
        onGoPageId={goById}
        onQuotes={() => {
          setTocOpen(false)
          setQuotesOpen(true)
        }}
      />

      <QuotesPanel
        open={quotesOpen}
        quotes={quotes}
        onClose={() => setQuotesOpen(false)}
        onBack={() => {
          setQuotesOpen(false)
          setTocOpen(true)
        }}
        onRemove={removeQuote}
        onGoPageId={goById}
      />
    </section>
  )
}
