import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
  type KeyboardEvent,
} from 'react'
import { asset } from '../asset'
import { useMediaQuery } from '../hooks'
import { fixPrepositions } from '../lib/fixPrepositions'
import '../styles/mission-circle-3d.css'

/**
 * Теги с `href` открываются в новой вкладке.
 * Теги без адреса остаются подписями и не уводят со страницы.
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
    tags: [],
  },
  {
    id: 'mental',
    title: 'Ментальное здоровье',
    text: 'Мы защищаем нейронные сети и помогаем сохранять ментальную независимость в любом возрасте.',
    tags: [
      { label: 'ПРОМОЗГ' },
      {
        label: 'СПЕКТРОГРАММА',
        href: 'https://geropharm.ru/about/sotsialnaya-otvetstvennost/zabota-o-patsiyente/nevrologiya/spektrogramma?ysclid=mtrjl53dp7214597105',
      },
    ],
  },
  {
    id: 'metabolic',
    title: 'Метаболическое здоровье',
    text: 'Мы работаем с причинами, которые запускают старение: ожирение и лишний вес.',
    tags: [
      {
        label: 'ОРБИТА',
        href: 'https://geropharm.ru/news/zapuscheno-pervoe-v-rossii-issledovanie-po-izucheniyu-problemy-oghireniya-v-regionah?ysclid=mtrjg07c2450246688',
      },
      {
        label: 'Stroynee',
        href: 'https://geropharm.ru/stroynee?ysclid=mtrjgpukfw709038533',
      },
      {
        label: 'Ничего лишнего',
        href: 'https://geropharm.ru/news/gerofarm-predstavlyaet-proekt-nichego-lishnego-iskusstvo-menyayuschee-vzglyad-na-problemu-oghireniya?ysclid=mtrjh8ozh2770785552',
      },
    ],
  },
  {
    id: 'diabetes',
    title: 'Сахарный диабет',
    text: 'Мы создаём препараты инсулина и среду для полноценной жизни с диабетом — рядом с пациентом с момента постановки диагноза.',
    tags: [
      { label: 'Диабет в лицах', href: 'https://diainpersons.ru/?ysclid=mtrji2om5q675125257' },
      {
        label: 'Лисена-сластена',
        href: 'https://geropharm.ru/about/sotsialnaya-otvetstvennost/zabota-o-patsiyente/endokrinologiya/diaskazki-lisena-slastena?ysclid=mtrjijz3fr120310112',
      },
      {
        label: '5 оттенков красоты',
        href: 'https://diainpersons.ru/photoproject_2024?ysclid=mtrjj00bz26544699',
      },
    ],
  },
  {
    id: 'partnership',
    title: 'Партнёрство',
    text: 'Мы растём вместе с профессиональным сообществом и внедряем цифровые решения.',
    tags: [{ label: 'Врач будущего', href: 'https://vrachbudushego.ru/' }],
  },
]

function CircleTag({ tag }: { tag: Circle3DTag }) {
  if (!tag.href || tag.href === '#') {
    return <span className="mc3d__tag">{tag.label}</span>
  }
  return (
    <a
      className="mc3d__tag"
      href={tag.href}
      target="_blank"
      rel="noreferrer"
      onClick={(ev) => ev.stopPropagation()}
    >
      {tag.label}
    </a>
  )
}

const N = PANELS.length
const STEP = 360 / N
const ROTATE_MS = 520

function normalizeIndex(rotation: number) {
  const raw = Math.round(-rotation / STEP)
  return ((raw % N) + N) % N
}

function shortestDelta(from: number, to: number) {
  let d = ((to - from) % 360 + 360) % 360
  if (d > 180) d -= 360
  return d
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function targetRotationForIndex(index: number) {
  return -(((index % N) + N) % N) * STEP
}

/**
 * Elliptical 360 orbit: front card largest/clearest; sides sit slightly lower
 * and turn with rotateY; far cards stay sharp (no blur), just smaller/fainter.
 */
function panelPose(
  panelIndex: number,
  rotation: number,
  orbitX: number,
  orbitZ: number,
) {
  let angle = ((panelIndex * STEP + rotation) % 360 + 360) % 360
  if (angle > 180) angle -= 360

  const abs = Math.abs(angle)
  const sign = Math.sign(angle || 1)
  const rad = (angle * Math.PI) / 180

  const x = Math.sin(rad) * orbitX
  // Active stays forward; sides fall back along the ellipse.
  const z = Math.cos(rad) * orbitZ
  // Farther from center → lower on screen (positive Y), never higher.
  const y = 20 + Math.min(24, abs * 0.22)
  const faceY = -sign * Math.min(28, abs * 0.36)

  let scale = 1
  let opacity = 1
  let zIndex = 5
  let slot: 'active' | 'near' | 'far' | 'hidden' = 'active'
  let visible = true

  if (abs < 22) {
    slot = 'active'
    scale = 1
    opacity = 1
    zIndex = 5
  } else if (abs < 95) {
    slot = 'near'
    scale = 0.9
    opacity = 0.72
    zIndex = 4
  } else if (abs < 155) {
    slot = 'far'
    scale = 0.78
    opacity = 0.38
    zIndex = 2
  } else {
    slot = 'hidden'
    scale = 0.72
    opacity = 0
    zIndex = 1
    visible = false
  }

  return {
    transform: `translate(-50%, -50%) translateX(${x.toFixed(1)}px) translateY(${y.toFixed(1)}px) translateZ(${z.toFixed(1)}px) rotateY(${faceY.toFixed(2)}deg) scale(${scale.toFixed(3)})`,
    opacity,
    zIndex,
    visible,
    slot,
  }
}

export function MissionCircle3DSlide() {
  const phone = useMediaQuery('(max-width: 768px)')
  const coarse = useMediaQuery('(pointer: coarse)')
  const [openId, setOpenId] = useState(PANELS[0].id)
  const [rotation, setRotation] = useState(0)
  const [ready, setReady] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [orbit, setOrbit] = useState({ x: 460, z: 220, perspective: 1400 })
  const viewportRef = useRef<HTMLDivElement>(null)
  const rotationRef = useRef(0)
  const wheelLock = useRef(false)
  const animFrameRef = useRef(0)
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
      if (w < 1024) setOrbit({ x: 300, z: 160, perspective: 1200 })
      else if (w < 1440) setOrbit({ x: 400, z: 200, perspective: 1400 })
      else setOrbit({ x: 460, z: 220, perspective: 1400 })
    }
    syncOrbit()
    window.addEventListener('resize', syncOrbit)
    return () => window.removeEventListener('resize', syncOrbit)
  }, [])

  useEffect(
    () => () => {
      if (animFrameRef.current) {
        window.cancelAnimationFrame(animFrameRef.current)
      }
    },
    [],
  )

  /** Animate orbit angle in JS so cards stay on the ellipse (no CSS fly-through-center). */
  const animateToRotation = useCallback((target: number) => {
    if (animFrameRef.current) {
      window.cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = 0
    }
    const from = rotationRef.current
    const delta = shortestDelta(from, target)
    if (Math.abs(delta) < 0.01) {
      setRotation(from + delta)
      return
    }
    const startedAt = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - startedAt) / ROTATE_MS)
      const next = from + delta * easeOutCubic(t)
      rotationRef.current = next
      setRotation(next)
      if (t < 1) {
        animFrameRef.current = window.requestAnimationFrame(tick)
      } else {
        animFrameRef.current = 0
      }
    }
    animFrameRef.current = window.requestAnimationFrame(tick)
  }, [])

  const goTo = useCallback(
    (index: number) => {
      animateToRotation(targetRotationForIndex(index))
    },
    [animateToRotation],
  )

  const stepBy = useCallback(
    (dir: 1 | -1) => {
      const nextIndex = normalizeIndex(rotationRef.current) + dir
      animateToRotation(targetRotationForIndex(nextIndex))
    },
    [animateToRotation],
  )

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
    if (!phone) return
    setOpenId(PANELS[normalizeIndex(rotationRef.current)].id)
  }, [phone])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || phone) return
    const prevent = (e: WheelEvent) => {
      e.preventDefault()
    }
    viewport.addEventListener('wheel', prevent, { passive: false })
    return () => viewport.removeEventListener('wheel', prevent)
  }, [phone])

  const onWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    if (phone) return
    e.preventDefault()
    e.stopPropagation()
    const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX
    if (Math.abs(delta) < 6 || wheelLock.current) return
    wheelLock.current = true
    // Wheel down / right → next card, matching drag-left.
    stepBy(delta > 0 ? 1 : -1)
    window.setTimeout(() => {
      wheelLock.current = false
    }, 480)
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    const target = e.target as HTMLElement | null
    if (target?.closest('a, button')) return
    if (animFrameRef.current) {
      window.cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = 0
    }
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startRotation: rotationRef.current,
    }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    const dx = e.clientX - drag.startX
    const next = drag.startRotation + dx * 0.28
    rotationRef.current = next
    setRotation(next)
  }

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    dragRef.current = null
    setDragging(false)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
    animateToRotation(
      targetRotationForIndex(normalizeIndex(rotationRef.current)),
    )
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
      <div className="mc3d__atmosphere" aria-hidden>
        <span className="mc3d__blob mc3d__blob--a" />
        <span className="mc3d__blob mc3d__blob--b" />
        <span className="mc3d__blob mc3d__blob--c" />
      </div>
      <header className="mc3d__head">
        <div className="mc3d__head-copy">
          <h1 className="mc3d__title">
            {fixPrepositions('ГЕРОФАРМ в экосистеме\nздорового долголетия')}
          </h1>
        </div>
        <span className="mc3d__mark">
          <span
            className="mc3d__icon-360"
            role="img"
            aria-label="360 градусов"
            style={{
              WebkitMaskImage: `url(${asset('icons/free-icon-360-degrees-974556.png')})`,
              maskImage: `url(${asset('icons/free-icon-360-degrees-974556.png')})`,
            }}
          />
        </span>
      </header>

      <div
        ref={viewportRef}
        className={`mc3d__viewport${dragging ? ' is-dragging' : ''}`}
        tabIndex={0}
        role="region"
        aria-roledescription="3D-карусель"
        aria-label="Экосистема здорового долголетия"
        aria-live="polite"
        style={phone ? undefined : { perspective: `${orbit.perspective}px` }}
        onPointerDown={phone ? undefined : onPointerDown}
        onPointerMove={phone ? undefined : onPointerMove}
        onPointerUp={phone ? undefined : endDrag}
        onPointerCancel={phone ? undefined : endDrag}
        onWheel={phone ? undefined : onWheel}
        onKeyDown={phone ? undefined : onKeyDown}
      >
        <div className="mc3d__stage">
          {PANELS.map((panel, i) => {
            const pose = panelPose(i, rotation, orbit.x, orbit.z)
            const isActive = i === active
            const open = openId === panel.id
            if (phone) {
              return (
                <article
                  key={panel.id}
                  className={`mc3d__panel${open ? ' is-open' : ''}`}
                >
                  <button
                    type="button"
                    className="mc3d__acc-toggle"
                    aria-expanded={open}
                    onClick={() =>
                      setOpenId((current) =>
                        current === panel.id ? '' : panel.id,
                      )
                    }
                  >
                    <h2 className="mc3d__panel-title">
                      {fixPrepositions(panel.title)}
                    </h2>
                    <span className="mc3d__chevron" aria-hidden />
                  </button>
                  <div className="mc3d__acc-body">
                    <div className="mc3d__acc-inner">
                      <p className="mc3d__panel-text">
                        {fixPrepositions(panel.text)}
                      </p>
                      <div className="mc3d__tags">
                        {panel.tags.map((tag) => (
                          <CircleTag key={tag.label} tag={tag} />
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              )
            }
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
                aria-hidden={!pose.visible}
                onClick={() => {
                  if (!isActive) goTo(i)
                }}
              >
                <h2 className="mc3d__panel-title">
                  {fixPrepositions(panel.title)}
                </h2>
                <p className="mc3d__panel-text">
                  {fixPrepositions(panel.text)}
                </p>
                <div className="mc3d__tags">
                  {panel.tags.map((tag) => (
                    <CircleTag key={tag.label} tag={tag} />
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
          {phone || coarse
            ? 'Нажми на карточку, чтобы раскрыть'
            : 'Крути карточки колёсиком мыши. Нажимай ссылки на карточках, чтобы узнать о проектах подробнее'}
        </p>
      </nav>
    </article>
  )
}

export default MissionCircle3DSlide
