import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import {
  historyPages,
  historyPianoYears,
  type HistoryBlock,
  type HistoryPage,
  type HistoryYearEntry,
} from '../data/history'
import { useMediaQuery } from '../hooks'
import { fixPrepositions } from '../lib/fixPrepositions'
import { SectionEndNav } from './SectionEndNav'
import '../styles/history-timeline.css'

type HistoryTimelineProps = {
  page: HistoryPage
  pageCount: number
  revealed: Set<number>
  onReveal: (index: number) => void
  onAdvance?: () => void
  onRetreat?: () => void
  onJumpYear?: (year: string) => void
  jumpYear?: string | null
  onJumpYearHandled?: () => void
  showHint: boolean
}

function RatingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

function RegistrationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  )
}

function EventSection({ block }: { block: HistoryBlock }) {
  if (block.tone === 'registration') {
    const lines =
      block.lines?.length
        ? block.lines
        : block.text
          ? [block.text]
          : []
    return (
      <div className="tlh__event tlh__event--registration">
        <div className="tlh__event-head">
          <span className="tlh__event-icon" aria-hidden>
            <RegistrationIcon />
          </span>
          <span className="tlh__event-kicker tlh__event-kicker--inline">
            {fixPrepositions(block.title || 'Регистрация препаратов')}
          </span>
        </div>
        {lines.length === 1 ? (
          <p className="tlh__block-text">{fixPrepositions(lines[0])}</p>
        ) : lines.length > 1 ? (
          <ul className="tlh__event-list">
            {lines.map((line) => (
              <li key={line}>{fixPrepositions(line)}</li>
            ))}
          </ul>
        ) : null}
      </div>
    )
  }

  return (
    <div className="tlh__event tlh__event--rating">
      <div className="tlh__event-head">
        <span className="tlh__event-icon" aria-hidden>
          <RatingIcon />
        </span>
        <span className="tlh__event-kicker tlh__event-kicker--inline">
          {fixPrepositions(block.title)}
        </span>
        {block.badge ? <span className="tlh__event-badge">{block.badge}</span> : null}
      </div>
      {block.text ? (
        <p className="tlh__block-text">{fixPrepositions(block.text)}</p>
      ) : null}
    </div>
  )
}

function YearCard({
  entry,
  isFocus,
  density,
}: {
  entry: HistoryYearEntry
  isFocus: boolean
  density: 'compact' | 'comfortable' | 'dense'
}) {
  return (
    <div className="tlh__item" data-year={entry.year} id={`tlh-year-${entry.year}`}>
      <article
        className={`tlh__card tlh__card--${density}${isFocus ? ' is-latest' : ''}`}
      >
        <span className="tlh__card-pill">{entry.year}</span>
        {entry.items.map((block) => {
          if (block.tone === 'rating' || block.tone === 'registration') {
            return (
              <EventSection
                key={`${block.tone}-${block.title}`}
                block={block}
              />
            )
          }

          return (
            <div
              className="tlh__block"
              key={`${block.tone ?? 'primary'}-${block.title}`}
            >
              <h3 className="tlh__block-title">{fixPrepositions(block.title)}</h3>
              {block.text ? (
                <p className="tlh__block-text">{fixPrepositions(block.text)}</p>
              ) : null}
            </div>
          )
        })}
      </article>
    </div>
  )
}

function chapterContentWeight(page: HistoryPage) {
  return page.years.reduce((sum, year) => {
    return (
      sum +
      year.items.reduce((inner, item) => {
        if (item.tone === 'registration') {
          return inner + 1.5 + (item.lines?.length ?? 0) * 0.45
        }
        if (item.tone === 'rating') {
          return inner + 2 + Math.min((item.text?.length ?? 0) / 220, 1)
        }
        return inner + 1 + Math.min((item.text?.length ?? 0) / 180, 1.4)
      }, 0)
    )
  }, 0)
}

function chapterDensity(page: HistoryPage): 'compact' | 'comfortable' | 'dense' {
  const weight = chapterContentWeight(page)
  if (page.years.length >= 4 || weight >= 9) return 'dense'
  if (weight <= 4.2 && page.years.length <= 2) return 'compact'
  return 'comfortable'
}

export function HistoryTimeline({
  page,
  pageCount,
  revealed,
  onReveal,
  onAdvance,
  onRetreat,
  onJumpYear,
  jumpYear = null,
  onJumpYearHandled,
  showHint,
}: HistoryTimelineProps) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const [activeYear, setActiveYear] = useState<string | null>(
    page.years[0]?.year ?? null,
  )
  const rootRef = useRef<HTMLElement>(null)
  const chapterRef = useRef<HTMLDivElement>(null)
  const pianoRef = useRef<HTMLDivElement>(null)
  const chipsRef = useRef<HTMLDivElement>(null)
  const wheelLock = useRef(false)
  const pendingYearRef = useRef<string | null>(null)
  const pinnedYearRef = useRef<string | null>(null)

  const phone = useMediaQuery('(max-width: 768px)')
  const total = page.years.length
  const isLastPage = page.index >= pageCount - 1
  const showEpilogue = isLastPage && (phone || revealed.size >= total)
  const density = chapterDensity(page)

  // Mobile: all cards at once. Desktop: progressive reveal — start with the first year.
  useLayoutEffect(() => {
    if (phone) {
      for (let i = 0; i < total; i++) onReveal(i)
      return
    }
    onReveal(0)
  }, [page.index, total, phone, onReveal])

  useEffect(() => {
    setActiveYear(page.years[0]?.year ?? null)
    pendingYearRef.current = null
    pinnedYearRef.current = null
    const root = chapterRef.current
    if (root) root.scrollTo({ top: 0, behavior: 'auto' })
    if (phone) {
      const readerPage = document.querySelector(
        '.reader__page:not([aria-hidden="true"])',
      ) as HTMLElement | null
      readerPage?.scrollTo({ top: 0, behavior: 'auto' })
      rootRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [page.index, page.years, phone])

  // Keep the right piano in sync with the latest revealed card.
  useEffect(() => {
    if (phone) return
    let latest = -1
    for (let i = 0; i < total; i++) {
      if (revealed.has(i)) latest = i
    }
    const year = page.years[latest]?.year
    if (!year || pinnedYearRef.current) return
    setActiveYear(year)
  }, [revealed, total, phone, page.years])

  const scrollChildInto = (
    root: HTMLElement,
    child: HTMLElement,
    axis: 'y' | 'x' | 'both',
  ) => {
    const rootRect = root.getBoundingClientRect()
    const childRect = child.getBoundingClientRect()
    const behavior = reduced ? 'auto' : 'smooth'

    if (axis === 'y' || axis === 'both') {
      const top = childRect.top - rootRect.top + root.scrollTop - 8
      root.scrollTo({ top: Math.max(0, top), behavior })
    }
    if (axis === 'x' || axis === 'both') {
      const left =
        childRect.left -
        rootRect.left +
        root.scrollLeft -
        root.clientWidth / 2 +
        childRect.width / 2
      root.scrollTo({ left: Math.max(0, left), behavior })
    }
  }

  const scrollToYear = (year: string) => {
    const node = rootRef.current?.querySelector<HTMLElement>(
      `.tlh__item[data-year="${year}"]`,
    )
    if (!node) return false

    if (phone) {
      const pageEl = document.querySelector(
        '.reader__page:not([aria-hidden="true"])',
      ) as HTMLElement | null
      if (!pageEl) return false
      const pageRect = pageEl.getBoundingClientRect()
      const nodeRect = node.getBoundingClientRect()
      const top = nodeRect.top - pageRect.top + pageEl.scrollTop - 12
      pageEl.scrollTo({
        top: Math.max(0, top),
        behavior: reduced ? 'auto' : 'smooth',
      })
      return true
    }

    const root = chapterRef.current
    if (!root) return false
    if (page.years.length === 1) {
      root.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
      return true
    }
    scrollChildInto(root, node, 'y')
    return true
  }

  const scrollPianoIntoView = (year: string) => {
    const root = pianoRef.current
    const key = root?.querySelector<HTMLElement>(
      `.piano-key[data-year="${year}"]`,
    )
    if (!root || !key) return
    if (root.scrollWidth > root.clientWidth + 2) {
      scrollChildInto(root, key, 'x')
    } else if (root.scrollHeight > root.clientHeight + 2) {
      scrollChildInto(root, key, 'y')
    }
  }

  const syncActiveFromScroll = () => {
    if (pinnedYearRef.current) return
    const root = chapterRef.current
    if (!root) return
    const items = [
      ...root.querySelectorAll<HTMLElement>('.tlh__item[data-year]'),
    ]
    if (!items.length) return

    const rootRect = root.getBoundingClientRect()
    const focusY = rootRect.top + root.clientHeight * 0.38

    let active = items[0]
    let bestDist = Number.POSITIVE_INFINITY
    for (const item of items) {
      const rect = item.getBoundingClientRect()
      const mid = rect.top + rect.height * 0.35
      const dist = Math.abs(mid - focusY)
      if (dist < bestDist) {
        bestDist = dist
        active = item
      }
    }

    if (root.scrollTop <= 2) {
      active = items[0]
    } else if (root.scrollTop + root.clientHeight >= root.scrollHeight - 6) {
      active = items[items.length - 1]
    }

    const year = active.dataset.year
    if (!year) return
    setActiveYear((prev) => {
      if (prev === year) return prev
      queueMicrotask(() => scrollPianoIntoView(year))
      return year
    })
  }

  useEffect(() => {
    if (!jumpYear) return
    pendingYearRef.current = jumpYear
    setActiveYear(jumpYear)
    scrollPianoIntoView(jumpYear)
    if (scrollToYear(jumpYear)) {
      pendingYearRef.current = null
      onJumpYearHandled?.()
    }
  }, [jumpYear, page.index, reduced, onJumpYearHandled])

  useEffect(() => {
    const el = chapterRef.current
    if (!el) return
    const pendingYear = pendingYearRef.current
    if (pendingYear) {
      if (scrollToYear(pendingYear)) {
        pendingYearRef.current = null
        onJumpYearHandled?.()
      }
      return
    }
    const id = window.setTimeout(() => syncActiveFromScroll(), reduced ? 0 : 80)
    return () => window.clearTimeout(id)
  }, [page.index, reduced, onJumpYearHandled])

  useEffect(() => {
    const root = chapterRef.current
    if (!root) return

    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        syncActiveFromScroll()
      })
    }

    root.addEventListener('scroll', onScroll, { passive: true })
    syncActiveFromScroll()

    return () => {
      root.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [page.index, reduced])

  const onPianoKeyClick = (year: string) => {
    const yearIndex = page.years.findIndex((entry) => entry.year === year)
    pinnedYearRef.current = year
    setActiveYear(year)
    scrollPianoIntoView(year)

    if (yearIndex < 0) {
      onJumpYear?.(year)
      window.setTimeout(() => {
        pinnedYearRef.current = null
      }, 360)
      return
    }

    // Reveal every card up to the chosen year, then scroll it into view.
    for (let i = 0; i <= yearIndex; i++) onReveal(i)
    pendingYearRef.current = year
    window.requestAnimationFrame(() => {
      if (scrollToYear(year)) pendingYearRef.current = null
      window.setTimeout(() => {
        pinnedYearRef.current = null
      }, 360)
    })
  }

  const retreatState = useRef({
    years: page.years,
    activeYear,
    onRetreat,
    onAdvance,
    phone,
  })
  retreatState.current = {
    years: page.years,
    activeYear,
    onRetreat,
    onAdvance,
    phone,
  }

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    // Phone only: advance past history after reaching the page bottom.
    // Desktop year-stepping was removed — it fought native scroll and caused jitter.
    const onWheelPhone = (e: globalThis.WheelEvent) => {
      const { onAdvance: advance, phone: isPhone } = retreatState.current
      if (!isPhone) return
      if (e.deltaY <= 8) return
      const pageEl = root.closest('.reader__page')
      if (!pageEl) return
      const atBottom =
        pageEl.scrollHeight - pageEl.scrollTop - pageEl.clientHeight <= 16
      if (!atBottom || !advance) return
      e.preventDefault()
      e.stopPropagation()
      if (wheelLock.current) return
      wheelLock.current = true
      advance()
      window.setTimeout(() => {
        wheelLock.current = false
      }, 520)
    }

    root.addEventListener('wheel', onWheelPhone, { capture: true, passive: false })
    return () => root.removeEventListener('wheel', onWheelPhone, { capture: true })
  }, [page.index])

  const onChapterWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    const el = chapterRef.current
    if (!el) return
    if (retreatState.current.phone) return
    if (Math.abs(e.deltaY) < 4) return

    const overflow = el.scrollHeight > el.clientHeight + 2
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2
    const atTop = el.scrollTop <= 1
    const hasMoreToReveal = revealed.size < total

    // Progressive reveal: each downward gesture adds the next year card under the stack.
    if (e.deltaY > 0 && hasMoreToReveal) {
      e.preventDefault()
      e.stopPropagation()
      if (wheelLock.current || !onAdvance) return
      wheelLock.current = true
      onAdvance()
      window.setTimeout(() => {
        wheelLock.current = false
      }, 320)
      return
    }

    if (e.deltaY > 0 && (!overflow || atBottom)) {
      e.preventDefault()
      e.stopPropagation()
      if (wheelLock.current || !onAdvance) return
      wheelLock.current = true
      onAdvance()
      window.setTimeout(() => {
        wheelLock.current = false
      }, 480)
      return
    }

    if (e.deltaY < 0 && (!overflow || atTop)) {
      e.preventDefault()
      e.stopPropagation()
      if (wheelLock.current || !onRetreat) return
      wheelLock.current = true
      onRetreat()
      window.setTimeout(() => {
        wheelLock.current = false
      }, 480)
      return
    }

    if (
      overflow &&
      ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop))
    ) {
      e.stopPropagation()
    }
  }

  useEffect(() => {
    if (!phone) return
    const root = chipsRef.current
    const chip = root?.querySelector<HTMLElement>(
      `.tlh__chip[data-chapter="${page.index}"]`,
    )
    if (!root || !chip) return
    scrollChildInto(root, chip, 'x')
  }, [page.index, phone, reduced])

  const yearCards = page.years.map((entry, index) => {
    if (!phone && !revealed.has(index)) return null
    return (
      <YearCard
        key={entry.year}
        entry={entry}
        isFocus={entry.year === activeYear}
        density={density}
      />
    )
  })

  if (phone) {
    return (
      <section
        ref={rootRef}
        className={`tlh tlh--${page.accent} tlh--mobile tlh--editorial`}
        aria-label={`История ГЕРОФАРМ · ${page.rangeLabel}`}
      >
        <header className="tlh__era-intro" aria-label="Описание периода">
          <div className="tlh__era-intro-inner">
            <span className="tlh__eyebrow">{page.eyebrow}</span>
            <h2 className="tlh__quote">{fixPrepositions(page.quote)}</h2>
            <div className="tlh__body">
              {page.body.map((p) => (
                <p key={p.slice(0, 32)}>{fixPrepositions(p)}</p>
              ))}
            </div>
          </div>
        </header>

        <div className="tlh__era-board">
          <nav
            ref={chipsRef}
            className="tlh__chips"
            aria-label="Периоды истории"
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onTouchCancel={(e) => e.stopPropagation()}
          >
            {historyPages.map((chapter) => (
              <button
                key={chapter.id}
                type="button"
                className={`tlh__chip${
                  chapter.index === page.index ? ' is-active' : ''
                }`}
                data-chapter={chapter.index}
                aria-current={chapter.index === page.index ? 'true' : undefined}
                onClick={() => {
                  const year = chapter.years[0]?.year
                  if (!year) return
                  if (chapter.index === page.index) {
                    setActiveYear(year)
                    scrollToYear(year)
                    return
                  }
                  onJumpYear?.(year)
                }}
              >
                {chapter.rangeLabel}
              </button>
            ))}
          </nav>

          <div
            ref={chapterRef}
            className="tlh__chapter tlh__chapter--mobile"
            aria-live="polite"
          >
            <div className="tlh__period tlh__period--in-panel">{page.rangeLabel}</div>
            {yearCards}
            {showEpilogue ? (
              <p className="tlh__epilogue" aria-live="polite">
                Реализуем стратегию и ищем новые возможности
              </p>
            ) : null}
          </div>

          <div className="tlh__period-nav">
            <button
              type="button"
              className="tlh__period-btn"
              disabled={page.index <= 0 || !onRetreat}
              onClick={() => onRetreat?.()}
            >
              Предыдущий период
            </button>
            <button
              type="button"
              className="tlh__period-btn tlh__period-btn--next"
              disabled={isLastPage || !onAdvance}
              onClick={() => onAdvance?.()}
            >
              Следующий период
            </button>
          </div>
          <SectionEndNav />
        </div>
      </section>
    )
  }

  return (
    <section
      ref={rootRef}
      className={`tlh tlh--${page.accent} tlh--aside-left tlh--editorial`}
      aria-label={`История ГЕРОФАРМ · ${page.rangeLabel}`}
    >
      <aside className="tlh__aside">
        <div className="tlh__aside-content">
          <span className="tlh__eyebrow">{page.eyebrow}</span>
          <h2 className="tlh__quote">{fixPrepositions(page.quote)}</h2>
          <div className="tlh__body">
            {page.body.map((p) => (
              <p key={p.slice(0, 32)}>
                {fixPrepositions(p)
                  .split('\n')
                  .map((line, i, arr) => (
                    <span key={`${i}-${line.slice(0, 16)}`}>
                      {line}
                      {i < arr.length - 1 ? <br /> : null}
                    </span>
                  ))}
              </p>
            ))}
          </div>
        </div>
      </aside>

      <div className="tlh__stage">
        <div className="tlh__main">
          <div
            ref={chapterRef}
            className={`tlh__chapter tlh__chapter--cards tlh__chapter--${density}`}
            aria-live="polite"
            onWheel={onChapterWheel}
          >
            {yearCards}
            {showEpilogue ? (
              <p className="tlh__epilogue" aria-live="polite">
                Реализуем стратегию и ищем новые возможности
              </p>
            ) : null}
          </div>
        </div>

        <nav
          ref={pianoRef}
          className="year-piano year-piano--secondary"
          aria-label="Навигация по годам"
        >
          {historyPianoYears.map((entry) => {
            const isActive = activeYear === entry.year
            return (
              <button
                key={entry.year}
                type="button"
                className={`piano-key${isActive ? ' is-active' : ''}`}
                data-year={entry.year}
                aria-label={`Перейти к ${entry.year}`}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onPianoKeyClick(entry.year)}
              >
                <span className="piano-key__bar" aria-hidden />
                <span className="piano-key__label">{entry.year}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {showHint && (
        <div className="hint-right">
          <span>Листай дальше</span>
          <span className="hint-right__arrow" aria-hidden>
            →
          </span>
        </div>
      )}
    </section>
  )
}
