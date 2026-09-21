import { useEffect, useState } from 'react'
import { Velaris } from './Velaris'
import '../styles/preloader.css'

interface PreloaderProps {
  onDone: () => void
}

const GRADIENT_COLORS = ['#FFA100', '#E040A0', '#1AA0FF', '#7B3DFF']

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

export function Preloader({ onDone }: PreloaderProps) {
  const [progress, setProgress] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setProgress(100)
      const t = window.setTimeout(() => {
        setLeaving(true)
        window.setTimeout(onDone, 200)
      }, 400)
      return () => window.clearTimeout(t)
    }

    const duration = 2800
    const start = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 3
      setProgress(Math.round(eased * 100))
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        window.setTimeout(() => {
          setLeaving(true)
          window.setTimeout(onDone, 950)
        }, 280)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onDone])

  return (
    <div
      className={`preloader${leaving ? ' is-leaving' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`Загрузка ${progress}%`}
    >
      <Velaris
        className="preloader__velaris"
        bg="#439EBC"
        colors={GRADIENT_COLORS}
        speed={2.2}
        grain={0.18}
        vignette={0}
      />

      <div className="preloader__center">
        <div className="preloader-brand">
          <span className="preloader-brand__word preloader-brand__word--left">ГЕРОФАРМ</span>
          <TransSymbol progress={progress} />
          <span className="preloader-brand__word preloader-brand__word--right">ТРАНСФОРМАЦИЯ</span>
        </div>

        <div className="preloader__count">
          <span className="preloader__count-num">{progress}</span>
          <span className="preloader__count-pct">%</span>
        </div>
      </div>
    </div>
  )
}
