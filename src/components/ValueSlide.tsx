import { asset } from '../asset'
import { fixPrepositions } from '../lib/fixPrepositions'
import { SectionEndNav } from './SectionEndNav'
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
            <p className="vs__lead">
              {subtitle.split('\n').map((line) => (
                <span key={line} className="vs__lead-line">
                  {fixPrepositions(line)}
                </span>
              ))}
            </p>
            <ul className="vs__steps">
              {bullets.map((bullet) => {
                const lines = bullet.split('\n')
                const isBroken = lines.length > 1

                return (
                  <li
                    key={bullet}
                    className={`vs__step${isBroken ? ' is-broken' : ''}`}
                  >
                    <span className="vs__step-dash" aria-hidden>
                      —
                    </span>
                    <span className="vs__step-text">
                      {lines.map((line) => (
                        <span key={line} className="vs__step-line">
                          {fixPrepositions(line)}
                        </span>
                      ))}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
        <div
          className="vs__photo"
          style={{ backgroundImage: `url(${asset(image)})` }}
          role="img"
          aria-label={title}
        />
      </section>

      <section className="vs__half vs__half--right" aria-label="Как мы живем по ценностям">
        <div className="vs__right-inner">
          <div className="vs__right-content">
            <div className="vs__right-head">
              <div className="vs__right-title-row">
                <h1 className="vs__right-title">
                  {fixPrepositions('КАК МЫ ЖИВЕМ ПО ЦЕННОСТЯМ')}
                </h1>
                <img
                  className={`vs__right-icon${
                    icon.includes('11.png') ? ' is-brain' : ''
                  }`}
                  src={asset(icon)}
                  alt=""
                  width={100}
                  height={100}
                  decoding="async"
                />
              </div>
              <h2 className="vs__section">
                {fixPrepositions('ВЫБОР В РАБОЧЕЙ СИТУАЦИИ')}
              </h2>
            </div>
            <div className="vs__story">
              {storyBlocks.map((block) => {
                const lines = block.text.split('\n')
                const isBroken = lines.length > 1

                return (
                  <p
                    key={block.label}
                    className={`vs__story-block${isBroken ? ' is-broken' : ''}`}
                  >
                    {lines.map((line, index) => (
                      <span key={`${block.label}-${index}`} className="vs__story-line">
                        {index === 0 ? (
                          <>
                            <strong>{block.label}:</strong>{' '}
                            {fixPrepositions(line)}
                          </>
                        ) : (
                          fixPrepositions(line)
                        )}
                      </span>
                    ))}
                  </p>
                )
              })}
            </div>
          </div>
        </div>
      </section>
      <SectionEndNav />
    </article>
  )
}
