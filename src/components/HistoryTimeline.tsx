import { useEffect, useRef, useState, type WheelEvent } from 'react'
import { historyPianoYears, type HistoryPage } from '../data/history'
import '../styles/history-timeline.css'

type HistoryTimelineProps = {
  page: HistoryPage
  pageCount: number
  revealed: Set<number>
  onReveal: (index: number) => void
  onAdvance?: () => void
  onJumpYear?: (year: string) => void
  jumpYear?: string | null
  onJumpYearHandled?: () => void
  showHint: boolean
}

export function HistoryTimeline({
  page,
  pageCount,
  revealed,
  onReveal,
  onAdvance,
  onJumpYear,
  jumpYear = null,
  onJumpYearHandled,
  showHint,
}: HistoryTimelineProps) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const [spineReady, setSpineReady] = useState(reduced)
  const [activeYear, setActiveYear] = useState<string | null>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const pianoRef = useRef<HTMLDivElement>(null)
  const wheelLock = useRef(false)
  const pendingYearRef = useRef<string | null>(null)

  useEffect(() => {
    if (reduced) {
      setSpineReady(true)
      return
    }
    setSpineReady(false)
    const id = window.requestAnimationFrame(() => setSpineReady(true))
    return () => window.cancelAnimationFrame(id)
  }, [page.index, reduced])

  useEffect(() => {
    setActiveYear(null)
    pendingYearRef.current = null
  }, [page.index])

  const total = page.years.length
  const allOpen = revealed.size >= total || reduced
  const latest = revealed.size ? Math.max(...revealed) : -1
  const openYears = page.years
    .map((entry, i) => ({ entry, i }))
    .filter(({ i }) => revealed.has(i) || reduced)

  const hasIncoming = page.index > 0
  const hasOutgoing = page.index < pageCount - 1

  let spineProgress = 0
  if (reduced || allOpen) {
    spineProgress = 1
  } else if (openYears.length > 0) {
    const maxOpen = Math.max(...[...revealed])
    spineProgress = Math.min(0.92, ((maxOpen + 1) / total) * 0.78 + 0.12)
  } else if (hasIncoming && spineReady) {
    spineProgress = 0.08
  }

  const spineOn = spineReady && (spineProgress > 0 || reduced)

  /** Scroll only inside a local scroller — never use scrollIntoView (it shifts the reader pages). */
  const scrollChildInto = (
    root: HTMLElement,
    child: HTMLElement,
    axis: 'y' | 'x' | 'both',
  ) => {
    const rootRect = root.getBoundingClientRect()
    const childRect = child.getBoundingClientRect()
    const behavior = reduced ? 'auto' : 'smooth'

    if (axis === 'y' || axis === 'both') {
      const top =
        childRect.top - rootRect.top + root.scrollTop - 8
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
    const root = cardsRef.current
    const card = root?.querySelector<HTMLElement>(
      `.tlh__item[data-year="${year}"]`,
    )
    if (!root || !card) return false
    scrollChildInto(root, card, 'y')
    return true
  }

  const scrollPianoIntoView = (year: string) => {
    const root = pianoRef.current
    const key = root?.querySelector<HTMLElement>(
      `.piano-key[data-year="${year}"]`,
    )
    if (!root || !key) return
    // Desktop piano rarely overflows; mobile strip scrolls horizontally.
    if (root.scrollWidth > root.clientWidth + 2) {
      scrollChildInto(root, key, 'x')
    } else if (root.scrollHeight > root.clientHeight + 2) {
      scrollChildInto(root, key, 'y')
    }
  }

  const syncActiveFromScroll = () => {
    const root = cardsRef.current
    if (!root) return
    const items = [
      ...root.querySelectorAll<HTMLElement>('.tlh__item[data-year]'),
    ]
    if (!items.length) return

    const rootRect = root.getBoundingClientRect()
    const focusY = rootRect.top + Math.min(120, root.clientHeight * 0.28)

    // Cards are top-to-bottom: last card whose top has crossed the focus line wins.
    let active = items[0]
    for (const item of items) {
      if (item.getBoundingClientRect().top <= focusY + 8) active = item
      else break
    }

    // At the very bottom — pin to the last visible card
    if (root.scrollTop + root.clientHeight >= root.scrollHeight - 6) {
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

  // When a new card opens, follow it; otherwise keep piano on the card in view
  useEffect(() => {
    if (latest < 0) return
    const year = page.years[latest]?.year
    if (!year) return
    // After reveal the list auto-scrolls to bottom — sync after that paint
    const id = window.requestAnimationFrame(() => syncActiveFromScroll())
    return () => window.cancelAnimationFrame(id)
  }, [latest, page.index])

  useEffect(() => {
    if (!jumpYear) return
    pendingYearRef.current = jumpYear
    setActiveYear(jumpYear)
    scrollPianoIntoView(jumpYear)
    if (scrollToYear(jumpYear)) {
      pendingYearRef.current = null
      onJumpYearHandled?.()
    }
  }, [jumpYear, openYears.length, reduced, onJumpYearHandled])

  useEffect(() => {
    const el = cardsRef.current
    if (!el || !openYears.length) return

    const pendingYear = pendingYearRef.current
    if (pendingYear) {
      if (scrollToYear(pendingYear)) {
        pendingYearRef.current = null
        onJumpYearHandled?.()
      }
      return
    }

    el.scrollTo({ top: el.scrollHeight, behavior: reduced ? 'auto' : 'smooth' })
    const id = window.setTimeout(() => syncActiveFromScroll(), reduced ? 0 : 280)
    return () => window.clearTimeout(id)
  }, [openYears.length, reduced, onJumpYearHandled])

  useEffect(() => {
    const root = cardsRef.current
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
  }, [openYears.length, page.index, reduced])

  const onPianoKeyClick = (year: string) => {
    const yearIndex = page.years.findIndex((entry) => entry.year === year)
    setActiveYear(year)

    if (yearIndex < 0) {
      onJumpYear?.(year)
      return
    }

    for (let i = 0; i <= yearIndex; i++) {
      if (!revealed.has(i)) onReveal(i)
    }

    pendingYearRef.current = year
    if (scrollToYear(year)) {
      pendingYearRef.current = null
    }
  }

  const onCardsWheel = (e: WheelEvent<HTMLDivElement>) => {
    const el = cardsRef.current
    if (!el) return

    // Reveal next card on wheel down before free-scrolling
    if (e.deltaY > 0 && !allOpen) {
      e.preventDefault()
      e.stopPropagation()
      if (wheelLock.current) return
      for (let i = 0; i < total; i++) {
        if (!revealed.has(i)) {
          wheelLock.current = true
          onReveal(i)
          window.setTimeout(() => {
            wheelLock.current = false
          }, 320)
          return
        }
      }
      return
    }

    const overflow = el.scrollHeight > el.clientHeight + 2
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2
    const atTop = el.scrollTop <= 1

    // After all cards are open and scrolled through — turn the page
    if (e.deltaY > 0 && allOpen && (!overflow || atBottom)) {
      e.preventDefault()
      e.stopPropagation()
      if (wheelLock.current || !onAdvance) return
      wheelLock.current = true
      onAdvance()
      window.setTimeout(() => {
        wheelLock.current = false
      }, 520)
      return
    }

    if (
      overflow &&
      ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop))
    ) {
      e.stopPropagation()
    }
  }

  return (
    <section
      className={`tlh tlh--${page.accent} tlh--aside-${page.asideSide}`}
      aria-label={`История ГЕРОФАРМ ${page.index + 1}/${pageCount}`}
    >
      <aside className="tlh__aside">
        <div className="tlh__aside-content">
          <span className="tlh__eyebrow">{page.eyebrow}</span>
          <h2 className="tlh__quote">{page.quote}</h2>
          <div className="tlh__body">
            {page.body.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
        </div>
      </aside>

      <div className="tlh__stage">
        <div className="tlh__main">
          <div className="tlh__counter" aria-live="polite">
            История ГЕРОФАРМ {page.index + 1}/{pageCount}
          </div>

          <div
            ref={cardsRef}
            className={`tlh__cards${hasIncoming ? ' has-in' : ''}${
              hasOutgoing && allOpen ? ' has-out' : ''
            }`}
            aria-live="polite"
            onWheel={onCardsWheel}
          >
            <div className="tlh__spine" aria-hidden>
              <div
                className={`tlh__spine-fill${spineOn ? ' is-on' : ''}`}
                style={
                  reduced
                    ? { transform: 'scaleY(1)' }
                    : { transform: `scaleY(${spineProgress})` }
                }
              />
            </div>

            {openYears.length === 0 && !reduced && (
              <p className="tlh__empty">Нажмите → или крутите колесо, чтобы открыть годы</p>
            )}

            {openYears.map(({ entry, i }, visualIndex) => (
              <div
                key={entry.year}
                className="tlh__item"
                data-year={entry.year}
                style={
                  reduced ? undefined : { animationDelay: `${visualIndex * 70}ms` }
                }
              >
                <div className="tlh__track" aria-hidden>
                  <span
                    className={`tlh__dot${
                      entry.year === activeYear || (reduced && i === latest)
                        ? ' is-active'
                        : ''
                    }`}
                  />
                </div>
                <article
                  id={`tlh-card-${page.id}-${entry.year}`}
                  className={`tlh__card${
                    entry.year === activeYear ? ' is-latest' : ''
                  }`}
                >
                  <span className="tlh__card-pill">{entry.year}</span>
                  {entry.items.map((block) => (
                    <div className="tlh__block" key={block.title}>
                      <h3 className="tlh__block-title">{block.title}</h3>
                      <p className="tlh__block-text">{block.text}</p>
                    </div>
                  ))}
                </article>
              </div>
            ))}
          </div>
        </div>

        <nav
          ref={pianoRef}
          className="year-piano"
          aria-label="Навигация по годам"
        >
          {historyPianoYears.map((entry) => {
            const isActive = activeYear === entry.year
            const onThisPage = page.years.some((y) => y.year === entry.year)
            return (
              <button
                key={entry.year}
                type="button"
                className={`piano-key${isActive ? ' is-active' : ''}${
                  onThisPage ? ' is-local' : ''
                }`}
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

      {showHint && !allOpen && (
        <div className="hint-right">
          <span>Листайте вправо</span>
          <span className="hint-right__arrow" aria-hidden>
            →
          </span>
        </div>
      )}
    </section>
  )
}
