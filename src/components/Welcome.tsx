import { useEffect, useRef, useState } from 'react'
import { asset } from '../asset'
import { fixPrepositions } from '../lib/fixPrepositions'
import '../styles/welcome.css'

interface WelcomeProps {
  onContinue: () => void
  onBack: () => void
}

export function Welcome({ onContinue, onBack }: WelcomeProps) {
  const rootRef = useRef<HTMLElement>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const swipeLock = useRef(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    // Desktop uses buttons — swipe tip only on phone.
    const isPhone =
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 860px)').matches
    if (!isPhone) return
    setToast('Это конец экрана — свайпни вбок\nили воспользуйся кнопками')
    const t = window.setTimeout(() => setToast(null), 4200)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const onTouchStart = (e: TouchEvent) => {
      if (swipeLock.current) {
        touchStart.current = null
        return
      }
      const target = e.target
      if (
        target instanceof Element &&
        target.closest('button, a, input, textarea, select, label, [role="button"]')
      ) {
        touchStart.current = null
        return
      }
      const t = e.changedTouches[0]
      touchStart.current = { x: t.clientX, y: t.clientY }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current || swipeLock.current) {
        touchStart.current = null
        return
      }
      const t = e.changedTouches[0]
      const dx = t.clientX - touchStart.current.x
      const dy = t.clientY - touchStart.current.y
      touchStart.current = null
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (absDx < 56 || absDx <= absDy) return

      swipeLock.current = true
      window.setTimeout(() => {
        swipeLock.current = false
      }, 420)

      // Swipe right → next screen; swipe left → previous screen
      if (dx > 0) onContinue()
      else onBack()
    }

    root.addEventListener('touchstart', onTouchStart, { passive: true })
    root.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      root.removeEventListener('touchstart', onTouchStart)
      root.removeEventListener('touchend', onTouchEnd)
    }
  }, [onContinue, onBack])

  return (
    <section ref={rootRef} className="welcome" aria-label="Добро пожаловать">
      <div className="welcome__grid" aria-hidden />

      <div className="welcome__inner">
        <img
          className="welcome__logo"
          src={asset('img/main/logo.svg')}
          alt="ГЕРОФАРМ ТРАНСФОРМАЦИЯ"
        />

        <h1 className="welcome__title">Добро пожаловать</h1>

        <div className="welcome__card">
          <p className="welcome__lead">
            {fixPrepositions(
              'Каждый день ты вносишь вклад в здоровье пациентов. Эта книга поможет увидеть, как твоя работа связана с общим результатом, почувствовать команду и двигаться вперёд увереннее — с пониманием и вдохновением.',
            )}
          </p>

          <div className="welcome__instruction">
            <strong>Как читать:</strong>
            <span>
              {fixPrepositions(
                'по порядку или сразу перейти к нужному разделу в меню',
              )}
            </span>
          </div>
        </div>

        {toast && (
          <div className="welcome__toast" role="status">
            {toast}
          </div>
        )}

        <div className="welcome__actions">
          <button type="button" className="secondary-btn" onClick={onBack}>
            На главную
          </button>
          <button type="button" className="primary-btn" onClick={onContinue}>
            Начать читать
          </button>
        </div>
      </div>
    </section>
  )
}
