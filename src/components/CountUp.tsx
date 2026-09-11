import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

type CountUpProps = {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
  delay?: number
  className?: string
}

export function CountUp({
  value,
  suffix = '',
  prefix = '',
  duration = 1.6,
  delay = 0,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting)
      },
      { threshold: 0.4 },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!active) {
      setDisplay(0)
      return
    }

    const state = { n: 0 }
    const tween = gsap.to(state, {
      n: value,
      duration,
      delay,
      ease: 'power2.out',
      onUpdate: () => setDisplay(Math.round(state.n)),
    })

    return () => {
      tween.kill()
    }
  }, [active, value, duration, delay])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString('ru-RU')}
      {suffix}
    </span>
  )
}
