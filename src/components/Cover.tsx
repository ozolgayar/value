import { BOOK_META } from '../data/book'
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

interface CoverProps {
  onOpen: () => void
}

export function Cover({ onOpen }: CoverProps) {
  return (
    <section className="cover" aria-label="Обложка книги">
      <div className="cover__media" aria-hidden />
      <div className="cover__veil" aria-hidden />

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

      <div className="cover__top">
        <img
          className="cover__logo"
          src="/logo/logo-horizontal.svg"
          alt="ГЕРОФАРМ 25"
        />
        <span className="pill cover__badge">{BOOK_META.badge}</span>
      </div>

      <div className="cover__content">
        <h1 className="cover__title">
          Культурный
          <br />
          путеводитель
          <br />
          ГЕРОФАРМ
        </h1>
        <p className="cover__hash">{BOOK_META.hashtag}</p>
        <div className="cover__actions">
          <button type="button" className="btn-primary" onClick={onOpen}>
            Открыть книгу
            <span aria-hidden>→</span>
          </button>
        </div>
        <p className="cover__hint">Плавный переход к содержанию</p>
      </div>
    </section>
  )
}
