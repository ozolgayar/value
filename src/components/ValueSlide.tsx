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

const STORY_LABELS = {
  situation: 'Ситуация',
  choice: 'Выбор',
  result: 'Результат',
} as const

export function ValueSlide({
  title,
  subtitle,
  bullets,
  image,
  accentColor,
  icon,
  story,
  pageClass,
}: ValueSlideProps) {
  const storyBlocks = (
    [
      ['situation', story.situation],
      ['choice', story.choice],
      ['result', story.result],
    ] as const
  ).map(([key, text]) => ({
    label: STORY_LABELS[key],
    text,
  }))

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
        <div
          className="vs__photo"
          style={{ backgroundImage: `url(${asset(image)})` }}
          role="img"
          aria-label="ГЕРОФАРМ"
        >
          <div className="vs__brand vs__brand--on-photo">
            <span>ГЕРОФАРМ</span>
            <span className="vs__mark" aria-hidden />
            <span>ТРАНСФОРМАЦИЯ</span>
          </div>
        </div>
      </section>

      <section className="vs__half vs__half--right" aria-label="Как мы живем по ценностям">
        <div className="vs__edge" aria-hidden />
        <div className="vs__right-inner">
          <div className="vs__right-content">
            <div className="vs__right-head">
              <div className="vs__right-head-text">
                <h1 className="vs__right-title">
                  {fixPrepositions('КАК МЫ ЖИВЕМ ПО ЦЕННОСТЯМ')}
                </h1>
                <h2 className="vs__section">
                  {fixPrepositions('ВЫБОР В РАБОЧЕЙ СИТУАЦИИ')}
                </h2>
              </div>
              <img
                className="vs__right-icon"
                src={asset(icon)}
                alt=""
                width={100}
                height={100}
                decoding="async"
              />
            </div>
            <div className="vs__story">
              {storyBlocks.map((block) => (
                <p key={block.label}>
                  <strong>{block.label}:</strong> {fixPrepositions(block.text)}
                </p>
              ))}
            </div>
          </div>
          <div className="vs__brand vs__brand--ink">
            <span>ГЕРОФАРМ</span>
            <span className="vs__mark" aria-hidden />
            <span>ТРАНСФОРМАЦИЯ</span>
          </div>
        </div>
      </section>
    </article>
  )
}
