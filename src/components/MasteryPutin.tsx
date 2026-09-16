import { masteryPutin } from '../data/masteryPutin'
import '../styles/mastery-semavic.css'

export function MasteryPutinPage() {
  const { left, right } = masteryPutin

  return (
    <article className="page-shell page-bleed page-mastery-semavic page-mastery-putin">
      <section className="ms__half ms__half--left" aria-label={left.title}>
        <div className="ms__edge ms__edge--left" aria-hidden />
        <div className="ms__left-inner">
          <span className="ms__badge">{left.badge}</span>
          <h1 className="ms__title">{left.title}</h1>
          <div className="ms__story">
            {left.paragraphs.map((p) => (
              <p key={p.slice(0, 36)}>{p}</p>
            ))}
          </div>
          <div className="ms__brand ms__brand--ink">
            <span>ГЕРОФАРМ</span>
            <span className="ms__mark" aria-hidden />
            <span>ТРАНСФОРМАЦИЯ</span>
          </div>
        </div>
      </section>

      <section className="ms__half ms__half--right" aria-label={right.lead}>
        <div className="ms__right-inner">
          <div className="ms__right-cols">
            <div className="ms__col-story">
              {right.story.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
            <div className="ms__col-values">
              <h2 className="ms__right-lead">{right.lead}</h2>
              <div className="ms__rc-values">
                {right.values.map((item) => (
                  <p key={item.name} className="ms__rc-value">
                    <span className="ms__value-term">{item.name} — </span>
                    {item.text}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="ms__brand ms__brand--light">
            <span>ГЕРОФАРМ</span>
            <span className="ms__mark" aria-hidden />
            <span>ТРАНСФОРМАЦИЯ</span>
          </div>
        </div>
      </section>
    </article>
  )
}
