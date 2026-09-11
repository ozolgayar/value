import { useEffect, useRef, useState, type WheelEvent } from 'react'
import { asset } from '../asset'
import { type HistoryPage } from '../data/history'
import '../styles/history-timeline.css'

type HistoryTimelineProps = {
  page: HistoryPage
  pageCount: number
  revealed: Set<number>
  onReveal: (index: number) => void
  onAdvance?: () => void
  showHint: boolean
}

export function HistoryTimeline({
  page,
  pageCount,
  revealed,
  onReveal,
  onAdvance,
  showHint,
}: HistoryTimelineProps) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const [spineReady, setSpineReady] = useState(reduced)
  const cardsRef = useRef<HTMLDivElement>(null)
  const wheelLock = useRef(false)

  useEffect(() => {
    if (reduced) {
      setSpineReady(true)
      return
    }
    setSpineReady(false)
    const id = window.requestAnimationFrame(() => setSpineReady(true))
    return () => window.cancelAnimationFrame(id)
  }, [page.index, reduced])

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

  useEffect(() => {
    const el = cardsRef.current
    if (!el || !openYears.length) return
    el.scrollTo({ top: el.scrollHeight, behavior: reduced ? 'auto' : 'smooth' })
  }, [openYears.length, reduced])

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
                style={
                  reduced ? undefined : { animationDelay: `${visualIndex * 70}ms` }
                }
              >
                <div className="tlh__track" aria-hidden>
                  <span
                    className={`tlh__dot${i === latest || reduced ? ' is-active' : ''}`}
                  />
                </div>
                <article
                  id={`tlh-card-${page.id}-${entry.year}`}
                  className={`tlh__card${i === latest ? ' is-latest' : ''}`}
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

        <div className="tlh__sticky-mark" aria-hidden>
          <img
            className="tlh__sticky-mark-img"
            src={asset('logo/trans-mark-only.png')}
            alt=""
          />
        </div>
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
