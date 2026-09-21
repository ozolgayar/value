import { asset } from '../asset'
import { valueAmbition } from '../data/valueAmbition'
import { fixPrepositions } from '../lib/fixPrepositions'
import '../styles/value-ambition.css'

export function ValueAmbitionPage() {
  const { left, right, image } = valueAmbition

  return (
    <article className="page-shell page-bleed page-value-ambition">
      <section className="va__half va__half--left" aria-label={left.title}>
        <div className="va__top">
          <div className="va__inset text-col--narrow">
            <span className="va__badge va__badge--light">{left.badge}</span>
            <h1 className="va__title">{fixPrepositions(left.title)}</h1>
            <p className="va__lead">{fixPrepositions(left.lead)}</p>
            <ul className="va__steps">
              {left.items.map((item) => (
                <li key={item.bold} className="va__step">
                  <span className="va__step-dash">—</span>
                  <span>
                    <strong>{fixPrepositions(item.bold)}</strong>{' '}
                    {fixPrepositions(item.rest)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div
          className="va__photo"
          style={{ backgroundImage: `url(${asset(image)})` }}
          role="img"
          aria-label="Производство ГЕРОФАРМ"
        >
          <div className="va__brand va__brand--on-photo">
            <span>ГЕРОФАРМ</span>
            <span className="va__mark" aria-hidden />
            <span>ТРАНСФОРМАЦИЯ</span>
          </div>
        </div>
      </section>

      <section className="va__half va__half--right" aria-label={right.title}>
        <div className="va__edge" aria-hidden />
        <div className="va__right-inner">
          <header className="va__right-head">
            <h1 className="va__right-title">{fixPrepositions(right.title)}</h1>
            <span className="va__badge va__badge--ink">{right.badge}</span>
          </header>
          <h2 className="va__section">{fixPrepositions(right.section)}</h2>
          <div className="va__story text-col">
            {right.blocks.map((block) => (
              <p key={block.label}>
                <strong>{block.label}:</strong> {fixPrepositions(block.text)}
              </p>
            ))}
          </div>
          <div className="va__brand va__brand--ink">
            <span>ГЕРОФАРМ</span>
            <span className="va__mark" aria-hidden />
            <span>ТРАНСФОРМАЦИЯ</span>
          </div>
        </div>
      </section>
    </article>
  )
}
