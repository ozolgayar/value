import { asset } from '../asset'
import type { PracticeCaseData } from '../data/practiceCase'
import '../styles/practice-equipment.css'

export function PracticeCasePage({ data }: { data: PracticeCaseData }) {
  const { left, right } = data

  return (
    <article className="page-shell page-bleed page-practice-equipment">
      <div className="pe__stage">
        <section className="pe__card pe__card--left" aria-label={left.title}>
          <span className="pe__badge">{left.badge}</span>
          <h1 className="pe__title">{left.title}</h1>

          <h2 className="pe__section pe__section--ink">{left.situationLabel}</h2>
          <p className="pe__situation">{left.situation}</p>

          <h2 className="pe__section pe__section--blue">{left.optionsLabel}</h2>
          <ul className="pe__options">
            {left.options.map((opt) => (
              <li key={opt.key} className="pe__option">
                <strong>{opt.key}</strong> {opt.text}
              </li>
            ))}
          </ul>

          <div className="pe__brand">
            <span>ГЕРОФАРМ</span>
            <span className="pe__mark" aria-hidden />
            <span>ТРАНСФОРМАЦИЯ</span>
          </div>
        </section>

        <section className="pe__card pe__card--right" aria-label={right.bestLabel}>
          <h1 className="pe__title">{right.title}</h1>

          <h2 className="pe__best">
            <strong>{right.bestLabel}</strong> {right.bestOption}
          </h2>

          <ul className="pe__values">
            {right.values.map((item) => (
              <li key={item.text} className="pe__value">
                <span className="pe__icon-wrap">
                  <img
                    className="pe__icon"
                    src={asset(item.icon)}
                    alt=""
                    aria-hidden
                  />
                </span>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>

          <p className="pe__result">
            <strong>{right.resultLabel}</strong> {right.result}
          </p>
        </section>
      </div>
    </article>
  )
}
