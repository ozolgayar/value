import { useId } from 'react'
import { BOOK_META } from '../data/book'
import { asset } from '../asset'
import '../styles/cover.css'

const particles = [
  { left: '10%', top: '22%', size: 7, delay: '0s', color: '#fff' },
  { left: '18%', top: '58%', size: 5, delay: '1.1s', color: '#3BB9B8' },
  { left: '42%', top: '16%', size: 6, delay: '0.4s', color: '#fff' },
  { left: '58%', top: '38%', size: 8, delay: '1.8s', color: '#E56814' },
  { left: '72%', top: '24%', size: 5, delay: '0.7s', color: '#3BB9B8' },
  { left: '78%', top: '62%', size: 7, delay: '1.4s', color: '#fff' },
  { left: '32%', top: '72%', size: 6, delay: '2.1s', color: '#E56814' },
  { left: '88%', top: '48%', size: 4, delay: '0.9s', color: '#fff' },
  { left: '8%', top: '78%', size: 5, delay: '1.6s', color: '#3BB9B8' },
]

const TICKER_ITEMS = [
  'ОТКРЫТОСТЬ',
  'ДОВЕРИЕ',
  'РАЗВИТИЕ',
  'ОТВЕТСТВЕННОСТЬ',
  'КОМАНДА',
  'АМБИЦИОЗНОСТЬ',
  'СТРАСТЬ',
]

function Logo25() {
  const uid = useId().replace(/:/g, '')
  const orangeId = `gph25-orange-${uid}`
  const tealId = `gph25-teal-${uid}`

  return (
    <div className="logo-25" aria-label="ГЕРОФАРМ 25">
      <svg
        className="logo-25__mark"
        viewBox="0 0 320 242"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id={orangeId} x1="241.11" y1="242.14" x2="241.11" y2="4.72" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#f7941d" />
            <stop offset="0.2" stopColor="#f68e1d" />
            <stop offset="0.43" stopColor="#f5801f" />
            <stop offset="0.69" stopColor="#f26723" />
            <stop offset="0.97" stopColor="#ef4528" />
            <stop offset="1" stopColor="#ef4129" />
          </linearGradient>
          <linearGradient id={tealId} x1="82.26" y1="237.56" x2="82.26" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#39bb9d" />
            <stop offset="1" stopColor="#128078" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${orangeId})`}
          d="M193.83,87.17c12.09-7.95,32.73-14.39,47.27-14.39,40.79,0,73.98,33.18,73.98,73.96v.06c0,40.79-33.19,73.92-73.97,73.92s-73.96-33.18-73.96-73.97h-21.44c0,52.6,42.8,95.4,95.4,95.4s95.25-42.94,95.4-95.41h0s0-.1,0-.14c0-.05,0-.1,0-.14h0c-.16-52.47-42.9-95.11-95.41-95.11-8.81,0-17.49,1.2-25.83,3.56v-28.73h72.86V4.72h-94.29v82.44Z"
        />
        <path
          fill={`url(#${tealId})`}
          d="M133.98,146.19h-.01c18.62-15.11,30.56-38.15,30.56-63.93C164.52,36.9,127.62,0,82.26,0S0,36.9,0,82.26c0,30.6,16.81,57.33,41.67,71.5l16.68-15.59c-21.68-9.31-36.91-30.87-36.91-55.92,0-33.54,27.29-60.82,60.82-60.82s60.82,27.29,60.82,60.82c0,17.33-7.3,32.98-18.97,44.07h.03S5.49,237.56,5.49,237.56h152.56v-21.44H59.76l74.22-69.93Z"
        />
      </svg>
      <span className="logo-25__word">ГЕРОФАРМ</span>
    </div>
  )
}

function Ticker() {
  const sequence = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="cover-ticker" aria-label="Ценности компании">
      <div className="cover-ticker__track">
        {sequence.map((item, i) => (
          <span key={`${item}-${i}`} className="cover-ticker__item">
            <span>{item}</span>
            <span className="cover-ticker__sep" aria-hidden>
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

interface CoverProps {
  onOpen: () => void
  /** Decorative clone in the split panel */
  inert?: boolean
}

export function Cover({ onOpen, inert = false }: CoverProps) {
  return (
    <section
      className="cover"
      aria-label={inert ? undefined : 'Обложка книги'}
      aria-hidden={inert || undefined}
    >
      <div className="cover-hero">
        <div className="cover__media" aria-hidden />
        <div className="cover__scrim" aria-hidden />
        <div className="cover__gradient" aria-hidden />
        <div className="cover__gradient-glow" aria-hidden />

        <div className="cover__particles" aria-hidden>
          {particles.map((p) => (
            <span
              key={`${p.left}-${p.top}`}
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                background: p.color,
                animationDelay: p.delay,
              }}
            />
          ))}
        </div>

        <div className="cover__top cover-fade cover-fade--top">
          <Logo25 />

          <span className="pill cover__badge">
            <span>ГЕРОФАРМ</span>
            <img
              className="cover__trans-mark"
              src={asset('logo/trans-mark-only.png')}
              alt=""
              aria-hidden
            />
            <span>ТРАНСФОРМАЦИЯ</span>
          </span>
        </div>

        <div className="cover__content">
          <h1 className="cover__title cover-fade cover-fade--title">
            Культурный
            <br />
            путеводитель
            <br />
            ГЕРОФАРМ
          </h1>
          <p className="cover__hash cover-fade cover-fade--hash">{BOOK_META.hashtag}</p>
          <div className="cover__actions cover-fade cover-fade--cta">
            <button
              type="button"
              className="btn-primary btn-open"
              onClick={onOpen}
              tabIndex={inert ? -1 : undefined}
            >
              Открыть книгу
              <span className="btn-open__arrow" aria-hidden>
                →
              </span>
            </button>
          </div>
        </div>
      </div>

      <Ticker />
    </section>
  )
}
