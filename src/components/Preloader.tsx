import { useEffect, useState } from 'react'
import { Velaris } from './Velaris'
import '../styles/preloader.css'

interface PreloaderProps {
  onDone: () => void
  /** Keep replaying for visual QA instead of dismissing. */
  loop?: boolean
}

const GRADIENT_COLORS = ['#FFA100', '#E040A0', '#1AA0FF', '#7B3DFF']

/** Paint blobs that bloom and fill the viewport as progress rises. */
const SPLASHES = [
  { color: '#FFA100', x: '12%', y: '78%', max: 2.35, delay: 0 },
  { color: '#E040A0', x: '82%', y: '18%', max: 2.55, delay: 0.06 },
  { color: '#1AA0FF', x: '48%', y: '52%', max: 2.9, delay: 0.12 },
  { color: '#7B3DFF', x: '22%', y: '28%', max: 2.2, delay: 0.18 },
  { color: '#FFA100', x: '70%', y: '72%', max: 2.1, delay: 0.22 },
  { color: '#E040A0', x: '38%', y: '12%', max: 1.85, delay: 0.28 },
  { color: '#1AA0FF', x: '92%', y: '48%', max: 2.05, delay: 0.34 },
  { color: '#7B3DFF', x: '8%', y: '52%', max: 1.95, delay: 0.4 },
] as const

/** Brand mark: CSS-masked silhouette that fills L→R with gradient */
function TransSymbol({ progress }: { progress: number }) {
  const fill = Math.max(0, Math.min(100, progress))
  return (
    <div className="preloader-symbol" aria-hidden>
      <span className="preloader-symbol__ghost" />
      <span
        className="preloader-symbol__fill"
        style={{ clipPath: `inset(0 ${100 - fill}% 0 0)` }}
      />
    </div>
  )
}

function splashScale(progress: number, delay: number, max: number) {
  const t = Math.max(0, Math.min(1, (progress / 100 - delay) / Math.max(0.01, 1 - delay)))
  const eased = 1 - (1 - t) ** 2.4
  return eased * max
}

export function Preloader({ onDone, loop = false }: PreloaderProps) {
  const [progress, setProgress] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [cycle, setCycle] = useState(0)
  const displayProgress = Math.max(0, Math.min(100, progress))

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setProgress(100)
      if (loop) return
      const t = window.setTimeout(() => {
        setLeaving(true)
        window.setTimeout(onDone, 200)
      }, 400)
      return () => window.clearTimeout(t)
    }

    const duration = 3200
    const start = performance.now()
    let raf = 0
    let holdTimer = 0
    let leaveTimer = 0

    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration))
      const eased = 1 - (1 - t) ** 3
      const next = Math.max(0, Math.min(100, Math.round(eased * 100)))
      setProgress(next)
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else if (loop) {
        holdTimer = window.setTimeout(() => {
          setProgress(0)
          setCycle((n) => n + 1)
        }, 700)
      } else {
        holdTimer = window.setTimeout(() => {
          setLeaving(true)
          leaveTimer = window.setTimeout(onDone, 950)
        }, 320)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(holdTimer)
      window.clearTimeout(leaveTimer)
    }
  }, [onDone, loop, cycle])

  return (
    <div
      className={`preloader${leaving ? ' is-leaving' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`Загрузка ${displayProgress}%`}
    >
      <Velaris
        className="preloader__velaris"
        bg="#439EBC"
        colors={GRADIENT_COLORS}
        speed={2.2}
        grain={0.14}
        vignette={0}
      />

      <div className="preloader__splashes" aria-hidden>
        {SPLASHES.map((splash, i) => {
          const scale = splashScale(displayProgress, splash.delay, splash.max)
          return (
            <span
              key={`${splash.color}-${i}`}
              className={`preloader__splash preloader__splash--${(i % 4) + 1}`}
              style={{
                left: splash.x,
                top: splash.y,
                background: splash.color,
                ['--splash-scale' as string]: String(scale),
                opacity: Math.min(0.95, 0.4 + scale * 0.35),
              }}
            />
          )
        })}
        <span
          className="preloader__splash-veil"
          style={{ opacity: Math.min(0.55, (displayProgress / 100) * 0.55) }}
        />
      </div>

      <div className="preloader__center">
        <div className="preloader-brand">
          <span className="preloader-brand__word preloader-brand__word--left">
            ГЕРОФАРМ
          </span>
          <TransSymbol progress={displayProgress} />
          <span className="preloader-brand__word preloader-brand__word--right">
            ТРАНСФОРМАЦИЯ
          </span>
        </div>

        <div className="preloader__count">
          <span className="preloader__count-num">{displayProgress}</span>
          <span className="preloader__count-pct">%</span>
        </div>
      </div>
    </div>
  )
}
