import { asset } from '../asset'
import { valueResponsibility } from '../data/valueResponsibility'
import '../styles/value-responsibility.css'

export function ValueResponsibilityPage() {
  const { left, right, image } = valueResponsibility

  return (
    <article className="page-shell page-bleed page-value-responsibility">
      <section className="vr__half vr__half--left" aria-label={left.title}>
        <div className="vr__top">
          <div className="vr__inset">
            <span className="vr__badge vr__badge--light">{left.badge}</span>
            <h1 className="vr__title">{left.title}</h1>
            <p className="vr__lead">{left.lead}</p>
            <ul className="vr__steps">
              {left.items.map((item, i) => (
                <li key={item.bold} className={`vr__step vr__step--${i + 1}`}>
                  <span className="vr__step-dash">—</span>
                  <span>
                    <strong>{item.bold}</strong> {item.rest}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div
          className="vr__photo"
          style={{ backgroundImage: `url(${asset(image)})` }}
          role="img"
          aria-label="Команда лаборатории ГЕРОФАРМ"
        >
          <div className="vr__brand vr__brand--on-photo">
            <span>ГЕРОФАРМ</span>
            <span className="vr__mark" aria-hidden />
            <span>ТРАНСФОРМАЦИЯ</span>
          </div>
        </div>
      </section>

      <section className="vr__half vr__half--right" aria-label={right.title}>
        <div className="vr__edge" aria-hidden />
        <div className="vr__right-inner">
          <header className="vr__right-head">
            <h1 className="vr__right-title">{right.title}</h1>
            <span className="vr__badge vr__badge--ink">{right.badge}</span>
          </header>
          <h2 className="vr__section">{right.section}</h2>
          <div className="vr__story">
            {right.blocks.map((block) => (
              <p key={block.label}>
                <strong>{block.label}:</strong> {block.text}
              </p>
            ))}
          </div>
          <div className="vr__brand vr__brand--ink">
            <span>ГЕРОФАРМ</span>
            <span className="vr__mark" aria-hidden />
            <span>ТРАНСФОРМАЦИЯ</span>
          </div>
        </div>
      </section>
    </article>
  )
}
