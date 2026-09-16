import { asset } from '../asset'
import { valuePassion } from '../data/valuePassion'
import '../styles/value-passion.css'

export function ValuePassionPage() {
  const { left, right, image } = valuePassion

  return (
    <article className="page-shell page-bleed page-value-passion">
      <section className="vp__half vp__half--left" aria-label={left.title}>
        <header className="vp__top">
          <div className="vp__inset">
            <span className="vp__badge vp__badge--light">{left.badge}</span>
            <h1 className="vp__title">{left.title}</h1>
            <p className="vp__lead">{left.lead}</p>
          </div>
        </header>
        <div
          className="vp__photo"
          style={{ backgroundImage: `url(${asset(image)})` }}
          role="img"
          aria-label="Команда ГЕРОФАРМ"
        />
        <div className="vp__bottom">
          <ul className="vp__steps">
            {left.items.map((item, i) => (
              <li key={item} className={`vp__step vp__step--${i + 1}`}>
                <span className="vp__step-dash">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="vp__brand vp__brand--on-dark">
            <span>ГЕРОФАРМ</span>
            <span className="vp__mark" aria-hidden />
            <span>ТРАНСФОРМАЦИЯ</span>
          </div>
        </div>
      </section>

      <section className="vp__half vp__half--right" aria-label={right.title}>
        <div className="vp__edge" aria-hidden />
        <div className="vp__right-inner">
          <header className="vp__right-head">
            <h1 className="vp__right-title">{right.title}</h1>
            <span className="vp__badge vp__badge--ink">{right.badge}</span>
          </header>
          <h2 className="vp__section">{right.section}</h2>
          <div className="vp__story">
            {right.blocks.map((block) => (
              <p key={block.label}>
                <strong>{block.label}:</strong> {block.text}
              </p>
            ))}
          </div>
          <div className="vp__brand vp__brand--ink">
            <span>ГЕРОФАРМ</span>
            <span className="vp__mark" aria-hidden />
            <span>ТРАНСФОРМАЦИЯ</span>
          </div>
        </div>
      </section>
    </article>
  )
}
