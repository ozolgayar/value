import { fixPrepositions } from '../lib/fixPrepositions'
import { masterySemavic } from '../data/masterySemavic'
import { MasteryDoor } from './MasteryDoor'
import '../styles/mastery-semavic.css'

export function MasterySemavicPage() {
  const { left, right } = masterySemavic

  return (
    <article className="page-shell page-bleed page-mastery-semavic">
      <section className="ms__half ms__half--left" aria-label={left.title}>
        <div className="ms__edge ms__edge--left" aria-hidden />
        <div className="ms__left-inner">
          <span className="ms__badge">{left.badge}</span>
          <h1 className="ms__title">
            {left.titleLines.map((line) => (
              <span key={line} className="ms__title-line">
                {fixPrepositions(line)}
              </span>
            ))}
          </h1>
          <div className="ms__story">
            {left.paragraphs.map((p) => (
              <p key={p.slice(0, 32)}>{fixPrepositions(p)}</p>
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
          <h2 className="ms__right-lead">{fixPrepositions(right.lead)}</h2>
          <ul className="ms__values">
            {right.values.map((item) => (
              <li key={item.name}>
                <strong>{item.name}</strong> — {fixPrepositions(item.text)}
              </li>
            ))}
          </ul>
          <div className="ms__brand ms__brand--light">
            <span>ГЕРОФАРМ</span>
            <span className="ms__mark" aria-hidden />
            <span>ТРАНСФОРМАЦИЯ</span>
          </div>
        </div>
        <MasteryDoor />
      </section>
    </article>
  )
}
