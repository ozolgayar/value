import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type UIEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import { practiceGallery } from '../data/practiceGallery'
import '../styles/practice-gallery.css'

const CARD_COUNT = practiceGallery.cards.length
const STEP = (Math.PI * 2) / CARD_COUNT

function wrapIndex(i: number) {
  return ((i % CARD_COUNT) + CARD_COUNT) % CARD_COUNT
}

function nearestIndex(rotation: number) {
  return wrapIndex(Math.round(-rotation / STEP))
}

function snapRotation(rotation: number) {
  return -nearestIndex(rotation) * STEP
}

export function PracticeGalleryPage({
  onOpenStory,
}: {
  onOpenStory?: (pageId: string) => void
}) {
  const [rotation, setRotation] = useState(0)
  const [stageSize, setStageSize] = useState({ w: 640, h: 560 })
  const [snapping, setSnapping] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rotationRef = useRef(0)
  const dragRef = useRef<{
    pointerId: number
    lastY: number
    lastX: number
  } | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const stripRef = useRef<HTMLDivElement | null>(null)

  const wheelActiveIndex = useMemo(() => nearestIndex(rotation), [rotation])
  const activeCard = practiceGallery.cards[activeIndex]

  const setRot = useCallback((next: number, withSnap = false) => {
    rotationRef.current = next
    setSnapping(withSnap)
    setRotation(next)
    setActiveIndex(nearestIndex(next))
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const measure = () => {
      const rect = stage.getBoundingClientRect()
      setStageSize({ w: rect.width, h: rect.height })
    }
    measure()

    const ro = new ResizeObserver(measure)
    ro.observe(stage)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const prevent = (e: WheelEvent) => {
      e.preventDefault()
    }
    stage.addEventListener('wheel', prevent, { passive: false })
    return () => stage.removeEventListener('wheel', prevent)
  }, [])

  const onWheel = useCallback(
    (e: ReactWheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX
      setRot(rotationRef.current + delta * 0.0028)
    },
    [setRot],
  )

  const onPointerDown = useCallback((e: ReactPointerEvent) => {
    if (e.button !== 0) return
    setSnapping(false)
    dragRef.current = {
      pointerId: e.pointerId,
      lastY: e.clientY,
      lastX: e.clientX,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback(
    (e: ReactPointerEvent) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== e.pointerId) return
      const dy = e.clientY - drag.lastY
      const dx = e.clientX - drag.lastX
      drag.lastY = e.clientY
      drag.lastX = e.clientX
      setRot(rotationRef.current + dy * 0.0075 + dx * 0.0035)
    },
    [setRot],
  )

  const endDrag = useCallback(
    (e: ReactPointerEvent) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== e.pointerId) return
      dragRef.current = null
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        /* already released */
      }
      setRot(snapRotation(rotationRef.current), true)
      window.setTimeout(() => setSnapping(false), 340)
    },
    [setRot],
  )

  const onStripScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const cards = el.querySelectorAll<HTMLElement>('.pg__strip-card')
    if (!cards.length) return
    const mid = el.scrollLeft + el.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    cards.forEach((card, i) => {
      const center = card.offsetLeft + card.offsetWidth / 2
      const dist = Math.abs(center - mid)
      if (dist < bestDist) {
        bestDist = dist
        best = i
      }
    })
    setActiveIndex(best)
  }, [])

  const goToStripIndex = useCallback((i: number) => {
    const el = stripRef.current
    if (!el) return
    const card = el.querySelectorAll<HTMLElement>('.pg__strip-card')[i]
    if (!card) return
    const left = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2
    el.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
    setActiveIndex(i)
  }, [])

  // Keep desktop wheel index as source of truth on desktop; sync on resize is light.
  useEffect(() => {
    if (window.matchMedia('(max-width: 1024px)').matches) return
    setActiveIndex(wheelActiveIndex)
  }, [wheelActiveIndex])

  const radius = Math.min(stageSize.w * 0.72, stageSize.h * 0.48)
  const hubX = stageSize.w * 0.02
  const hubY = stageSize.h * 0.5

  return (
    <article
      className="page-shell page-bleed page-practice-gallery"
      aria-label="Галерея практик-тренажёров"
    >
      <div className="pg__inner">
        <div className="pg__focus">
          <h2 className="pg__focus-title">{activeCard.title}</h2>
          <button
            type="button"
            className="pg__select"
            onClick={() => onOpenStory?.(activeCard.pageId)}
          >
            Выбрать
          </button>
        </div>

        <div
          ref={stageRef}
          className="pg__stage"
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div className="pg__wheel" aria-hidden>
            {practiceGallery.cards.map((card, i) => {
              const angle = rotation + i * STEP
              const depth = Math.cos(angle)
              const front = (depth + 1) / 2
              const visible = depth > -0.35
              const baseScale = 0.72 + front * 0.38
              const scale = i === activeIndex ? baseScale * 1.04 : baseScale
              const opacity = visible ? 0.35 + front * 0.65 : 0
              const z = Math.round(front * 100)
              const x = hubX + Math.cos(angle) * radius
              const y = hubY + Math.sin(angle) * radius
              const isActive = i === activeIndex

              return (
                <div
                  key={card.id}
                  className={`pg__card${isActive ? ' is-active' : ''}${
                    snapping ? ' is-snapping' : ''
                  }`}
                  style={{
                    background: card.gradient,
                    transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`,
                    zIndex: z,
                    opacity,
                  }}
                />
              )
            })}
          </div>
        </div>

        <div
          ref={stripRef}
          className="pg__strip"
          onScroll={onStripScroll}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {practiceGallery.cards.map((card, i) => (
            <button
              key={card.id}
              type="button"
              className={`pg__strip-card${i === activeIndex ? ' is-active' : ''}`}
              style={{ background: card.gradient }}
              aria-label={card.title}
              aria-current={i === activeIndex ? 'true' : undefined}
              onClick={() => goToStripIndex(i)}
            />
          ))}
        </div>

        <div className="pg__dots" role="tablist" aria-label="Практики">
          {practiceGallery.cards.map((card, i) => (
            <button
              key={card.id}
              type="button"
              role="tab"
              className={`pg__dot${i === activeIndex ? ' is-active' : ''}`}
              aria-label={card.title}
              aria-selected={i === activeIndex}
              onClick={() => goToStripIndex(i)}
            />
          ))}
        </div>

        <p className="pg__instruction">
          <span className="pg__instruction-desk">
            Крути колесо левой кнопкой
            <br />
            или колесом мыши, чтобы выбрать историю
          </span>
          <span className="pg__instruction-mobile">Свайпни, чтобы листать</span>
        </p>
      </div>
    </article>
  )
}
