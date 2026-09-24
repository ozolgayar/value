import { Fragment } from 'react'
import { fixPrepositions, splitHighlighted } from '../lib/fixPrepositions'
import { masteryThirdLine } from '../data/masteryThirdLine'
import { MasteryDoor } from './MasteryDoor'
import '../styles/mastery-semavic.css'

const FACT_HIGHLIGHTS = [
  '21 млн инъекторов в год',
  'инсулины',
  '2023',
  '2024',
  '2025',
  '1000',
]

function FactParagraph({ text }: { text: string }) {
  const chunks = splitHighlighted(text, FACT_HIGHLIGHTS)
  return (
    <p>
      {chunks.map((chunk, i) =>
        chunk.highlight ? (
          <strong key={`${chunk.text}-${i}`} className="ms__fact">
            {chunk.text}
          </strong>
        ) : (
          <Fragment key={`${chunk.text.slice(0, 12)}-${i}`}>{chunk.text}</Fragment>
        ),
      )}
    </p>
  )
}

export function MasteryThirdLinePage() {
  const { left, right } = masteryThirdLine

  return (
    <article className="page-shell page-bleed page-mastery-semavic page-mastery-third-line">
      <section className="ms__half ms__half--left" aria-label={left.titleLines.join(' ')}>
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
              <FactParagraph key={p.slice(0, 36)} text={p} />
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
                <FactParagraph key={p.slice(0, 40)} text={p} />
              ))}
            </div>
            <div className="ms__col-values">
              <h2 className="ms__right-lead">{fixPrepositions(right.lead)}</h2>
              <div className="ms__rc-values">
                {right.values.map((item) => (
                  <p key={item.name} className="ms__rc-value">
                    <span className="ms__value-term">{item.name} — </span>
                    {fixPrepositions(item.text)}
                  </p>
                ))}
              </div>
              <div className="ms__brand ms__brand--light">
                <span>ГЕРОФАРМ</span>
                <span className="ms__mark" aria-hidden />
                <span>ТРАНСФОРМАЦИЯ</span>
              </div>
            </div>
          </div>
        </div>
        <MasteryDoor />
      </section>
    </article>
  )
}
