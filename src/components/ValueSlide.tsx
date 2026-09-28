import { asset } from '../asset'
import { fixPrepositions } from '../lib/fixPrepositions'
import '../styles/value-slide.css'

export type ValueSlideAccent = 'violet' | 'orange' | 'blue'

export type ValueSlideProps = {
  title: string
  subtitle: string
  bullets: string[]
  image: string
  accentColor: ValueSlideAccent
  icon: string
  story: {
    situation: string
    choice: string
    result: string
  }
  /** Reader theme hook: page-value-ambition | page-value-passion | page-value-responsibility */
  pageClass: string
}

export function ValueSlide({
  title,
  subtitle,
  bullets,
  image,
  accentColor,
  pageClass,
}: ValueSlideProps) {
  return (
    <article
      className={`page-shell page-bleed ${pageClass} vs`}
      data-accent={accentColor}
    >
      <section className="vs__half vs__half--left" aria-label={title}>
        <div className="vs__top">
          <div className="vs__inset">
            <span className="vs__badge">ЦЕННОСТИ ГЕРОФАРМ</span>
            <h1 className="vs__title">{fixPrepositions(title)}</h1>
            <p className="vs__lead">{fixPrepositions(subtitle)}</p>
            <ul className="vs__steps">
              {bullets.map((bullet) => (
                <li key={bullet} className="vs__step">
                  <span className="vs__step-dash" aria-hidden>
                    —
                  </span>
                  <span>{fixPrepositions(bullet)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="vs__half vs__half--right">
        <div
          className="vs__portrait"
          style={{ backgroundImage: `url(${asset(image)})` }}
          role="img"
          aria-label={title}
        >
          <div className="vs__brand vs__brand--on-photo">
            <span>ГЕРОФАРМ</span>
            <span className="vs__mark" aria-hidden />
            <span>ТРАНСФОРМАЦИЯ</span>
          </div>
        </div>
      </section>
    </article>
  )
}
