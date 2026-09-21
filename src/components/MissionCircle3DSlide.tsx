import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent,
} from 'react'
import { fixPrepositions } from '../lib/fixPrepositions'
import '../styles/mission-circle-3d.css'

/**
 * Ссылки в тегах карточек кликабельны (href="#").
 * Позже можно подставить реальные URL в поле `href` у тегов.
 */

export type Circle3DTag = {
  label: string
  /** Подставьте внешний URL позже — сейчас placeholder "#" */
  href?: string
}

export type Circle3DPanel = {
  id: string
  title: string
  text: string
  tags: Circle3DTag[]
}

const PANELS: Circle3DPanel[] = [
  {
    id: 'reproductive',
    title: 'Репродуктивное долголетие',
    text: 'Мы поддерживаем активность и достоинство пациентов, корректируя возрастные изменения и предотвращая патологии.',
    tags: [
      { label: 'Здоровье женщины' },
      { label: 'Здоровье мужчины' },
      { label: 'Планирование семьи' },
    ],
  },
  {
    id: 'mental',
    title: 'Ментальное здоровье',
    text: 'Мы защищаем нейронные сети и помогаем сохранять ментальную независимость в любом возрасте.',
    tags: [{ label: 'ПРОМОЗГ' }, { label: 'СПЕКТРОГРАММА' }],
  },
  {
    id: 'metabolic',
    title: 'Метаболическое здоровье',
    text: 'Мы работаем с причинами, которые запускают старение: ожирение и лишний вес.',
    tags: [{ label: 'ОРБИТА' }, { label: 'Stroynee' }, { label: 'Ничего лишнего' }],
  },
  {
    id: 'diabetes',
    title: 'Сахарный диабет',
    text: 'Мы создаём препараты инсулина и среду для полноценной жизни с диабетом — рядом с пациентом с момента постановки диагноза.',
    tags: [
      { label: 'Диабет в лицах' },
      { label: 'Лисена-сластена' },
      { label: '5 оттенков красоты' },
    ],
  },
  {
    id: 'partnership',
    title: 'Партнёрство',
    text: 'Мы растём вместе с профессиональным сообществом и внедряем цифровые решения.',
    tags: [
      { label: 'Врач будущего' },
      { label: 'цифровые решения' },
      { label: 'врачебное сообщество' },
      { label: 'образование' },
    ],
  },
]

const N = PANELS.length
const STEP = 360 / N

function normalizeIndex(rotation: number) {
  const raw = Math.round(-rotation / STEP)
  return ((raw % N) + N) % N
}

function shortestDelta(from: number, to: number) {
  let d = ((to - from) % 360 + 360) % 360
  if (d > 180) d -= 360
  return d
}

/** Soft cover-flow pose: neighbors stay readable (titles visible), not edge-on strips. */
function panelPose(
  panelIndex: number,
  rotation: number,
  orbitX: number,
  orbitZ: number,
) {
  let angle = ((panelIndex * STEP + rotation) % 360 + 360) % 360
  if (angle > 180) angle -= 360

  const abs = Math.abs(angle)
  const rad = (angle * Math.PI) / 180
  const x = Math.sin(rad) * orbitX
  const z = Math.cos(rad) * orbitZ - orbitZ
  const faceY = Math.sign(angle || 1) * Math.min(30, abs * 0.42)
  const t = Math.min(1, abs / 160)
  const opacity = abs > 150 ? 0 : 1 - t * 0.22
  const scale = 1 - t * 0.05
  const visible = abs < 155

  return {
    transform: `translateX(${x.toFixed(1)}px) translateZ(${z.toFixed(1)}px) rotateY(${faceY.toFixed(2)}deg) scale(${scale.toFixed(3)})`,
    opacity,
    zIndex: Math.round((1 - t) * 50),
    visible,
  }
}

export function MissionCircle3DSlide() {
  const [rotation, setRotation] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [ready, setReady] = useState(false)
  const [orbit, setOrbit] = useState({ x: 460, z: 300 })
  const viewportRef = useRef<HTMLDivElement>(null)
  const rotationRef = useRef(0)
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startRotation: number
  } | null>(null)

  rotationRef.current = rotation
  const active = normalizeIndex(rotation)

  useEffect(() => {
    const syncOrbit = () => {
      const w = window.innerWidth
      if (w < 640) setOrbit({ x: 250, z: 180 })
      else if (w < 1100) setOrbit({ x: 360, z: 240 })
      else setOrbit({ x: 480, z: 320 })
    }
    syncOrbit()
    window.addEventListener('resize', syncOrbit)
    return () => window.removeEventListener('resize', syncOrbit)
  }, [])

  const goTo = useCallback((index: number) => {
    const target = -(((index % N) + N) % N) * STEP
    setRotation((prev) => prev + shortestDelta(prev, target))
    setAnimating(true)
  }, [])

  const stepBy = useCallback((dir: 1 | -1) => {
    setRotation((prev) => {
      const nextIndex = normalizeIndex(prev) + dir
      return prev + shortestDelta(prev, -(((nextIndex % N) + N) % N) * STEP)
    })
    setAnimating(true)
  }, [])

  useEffect(() => {
    let cancelled = false
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (!cancelled) setReady(true)
      })
    })
    return () => {
      cancelled = true
      window.cancelAnimationFrame(id)
    }
  }, [])

  useEffect(() => {
    if (!animating) return
    const id = window.setTimeout(() => setAnimating(false), 520)
    return () => window.clearTimeout(id)
  }, [animating, rotation])

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    const target = e.target as HTMLElement | null
    if (target?.closest('a, button')) return
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startRotation: rotation,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    const dx = e.clientX - drag.startX
    setRotation(drag.startRotation + dx * 0.28)
    setAnimating(false)
  }

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    dragRef.current = null
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
    const snapped = -normalizeIndex(rotationRef.current) * STEP
    setRotation((prev) => prev + shortestDelta(prev, snapped))
    setAnimating(true)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      e.stopPropagation()
      stepBy(1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      e.stopPropagation()
      stepBy(-1)
    }
  }

  return (
    <article
      className={`page-shell page-bleed page-mission-eco mc3d${ready ? ' is-ready' : ''}`}
    >
      <header className="mc3d__head">
        <span className="mc3d__badge">МИССИЯ ГЕРОФАРМ</span>
        <h1 className="mc3d__title">
          {fixPrepositions('ГЕРОФАРМ в экосистеме\nздорового долголетия 360°')}
        </h1>
      </header>

      <div
        ref={viewportRef}
        className="mc3d__viewport"
        tabIndex={0}
        role="region"
        aria-roledescription="3D-карусель"
        aria-label="Экосистема здорового долголетия"
        aria-live="polite"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        <div className={`mc3d__stage${animating ? ' is-anim' : ''}`}>
          {PANELS.map((panel, i) => {
            const pose = panelPose(i, rotation, orbit.x, orbit.z)
            const isActive = i === active
            return (
              <article
                key={panel.id}
                className={`mc3d__panel${isActive ? ' is-active' : ''}${
                  pose.visible ? '' : ' is-far'
                }`}
                style={{
                  transform: pose.transform,
                  opacity: pose.opacity,
                  zIndex: pose.zIndex,
                  pointerEvents: pose.visible ? 'auto' : 'none',
                }}
                aria-hidden={!isActive}
                onClick={() => {
                  if (!isActive) goTo(i)
                }}
              >
                <h2 className="mc3d__panel-title">
                  {fixPrepositions(panel.title)}
                </h2>
                <p className="mc3d__panel-text">{fixPrepositions(panel.text)}</p>
                <div className="mc3d__tags">
                  {panel.tags.map((tag) => (
                    <a
                      key={tag.label}
                      className="mc3d__tag"
                      href={tag.href || '#'}
                      target={tag.href && tag.href !== '#' ? '_blank' : undefined}
                      rel={tag.href && tag.href !== '#' ? 'noreferrer' : undefined}
                      onClick={(ev) => {
                        if (!tag.href || tag.href === '#') ev.preventDefault()
                        ev.stopPropagation()
                      }}
                    >
                      {tag.label}
                    </a>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <nav className="mc3d__controls" aria-label="Навигация по направлениям">
        <div className="mc3d__dots" role="tablist">
          {PANELS.map((panel, i) => (
            <button
              key={panel.id}
              type="button"
              role="tab"
              className={`mc3d__dot${i === active ? ' is-active' : ''}`}
              aria-label={panel.title}
              aria-selected={i === active}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        <p className="mc3d__hint">
          Зажмите карточку мышью и переместите влево или вправо, чтобы крутить.
          Нажмите на название проекта и откроется подробная информация.
        </p>
      </nav>
    </article>
  )
}

export default MissionCircle3DSlide
