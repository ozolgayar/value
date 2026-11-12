import { fixPrepositions } from '../lib/fixPrepositions'
import { masterySemavic } from '../data/masterySemavic'
import { MasteryDoor } from './MasteryDoor'
import { SectionEndNav } from './SectionEndNav'
import '../styles/mastery-semavic.css'

export function MasterySemavicPage() {
  const { left, right } = masterySemavic

  return (
    <article className="page-shell page-bleed page-mastery-semavic">
      <section className="ms__half ms__half--left" aria-label={left.title}>
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
          <div className="ms__right-cols">
            <div className="ms__col-story">
              {/* Row 1: mirrors left badge+title so body rows share tops with values */}
              <div className="ms__align-spacer" aria-hidden>
                <span className="ms__badge">{left.badge}</span>
                <h1 className="ms__title">
                  {left.titleLines.map((line) => (
                    <span key={line} className="ms__title-line">
                      {fixPrepositions(line)}
                    </span>
                  ))}
                </h1>
              </div>
              {right.story.map((p) => (
                <p key={p.slice(0, 36)} className="ms__story-p">
                  {fixPrepositions(p)}
                </p>
              ))}
            </div>
            <div className="ms__col-values">
              {/* Row 1: height lock only — lead is abspos so it can't inflate the row */}
              <div className="ms__align-spacer" aria-hidden>
                <span className="ms__badge">{left.badge}</span>
                <h1 className="ms__title">
                  {left.titleLines.map((line) => (
                    <span key={line} className="ms__title-line">
                      {fixPrepositions(line)}
                    </span>
                  ))}
                </h1>
              </div>
              <div className="ms__lead-slot">
                <span className="ms__badge" aria-hidden>
                  {left.badge}
                </span>
                <h2 className="ms__right-lead">{fixPrepositions(right.lead)}</h2>
              </div>
              {right.values.map((item) => (
                <p key={item.name} className="ms__rc-value">
                  <span className="ms__value-term">{item.name} — </span>
                  {fixPrepositions(item.text)}
                </p>
              ))}
            </div>
          </div>
        </div>
        <MasteryDoor />
      </section>
      <SectionEndNav />
    </article>
  )
}
