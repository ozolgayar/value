import { asset } from '../asset'
import { valuesSpread } from '../data/valuesSpread'
import { fixPrepositions } from '../lib/fixPrepositions'
import '../styles/values-spread.css'

export function ValuesSpreadPage() {
  const { left, right } = valuesSpread

  return (
    <article className="page-shell page-bleed page-values-spread">
      <section
        className="values-spread__half values-spread__half--left"
        aria-label={left.title}
      >
        <div className="values-spread__inner">
          <header className="values-spread__intro">
            <span className="values-spread__badge">{left.badge}</span>
            <h1 className="values-spread__title">
              {fixPrepositions(left.title)}
            </h1>
          </header>

          <ul className="values-spread__rows">
            {left.items.map((item) => (
              <li key={item.title} className="values-spread__row">
                <div className="values-spread__row-lead">
                  <span className="values-spread__icon-wrap" aria-hidden>
                    <img
                      className={`values-spread__icon${
                        item.icon.includes('11.png') ? ' is-brain' : ''
                      }`}
                      src={asset(item.icon)}
                      alt=""
                      draggable={false}
                    />
                  </span>
                  <h2 className="values-spread__row-title">
                    {fixPrepositions(item.title)}
                  </h2>
                </div>
                <p className="values-spread__row-text">
                  {fixPrepositions(item.text)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <footer className="values-spread__brand">
          <span>ГЕРОФАРМ</span>
          <span className="values-spread__brand-mark" aria-hidden />
          <span>ТРАНСФОРМАЦИЯ</span>
        </footer>
      </section>

      <section
        className="values-spread__half values-spread__half--right"
        aria-label={right.title}
      >
        <div className="values-spread__inner values-spread__inner--right">
          <h1 className="values-spread__title values-spread__title--right">
            {fixPrepositions(right.title)}
          </h1>
          <ul className="values-spread__cards">
            {right.items.map((item) => (
              <li
                key={item.name}
                className="values-spread__card"
                style={{ ['--value-color' as string]: item.color }}
              >
                <div className="values-spread__card-copy">
                  <h2 className="values-spread__card-name">{item.name}</h2>
                  <p className="values-spread__card-text">
                    {fixPrepositions(item.text)}{' '}
                    <strong>{fixPrepositions(item.slogan)}</strong>
                  </p>
                </div>
                <div className="values-spread__card-aside" aria-hidden>
                  <span className="values-spread__card-icon-wrap">
                    <img
                      className={`values-spread__card-icon${
                        item.icon.includes('11.png') ? ' is-brain' : ''
                      }`}
                      src={asset(item.icon)}
                      alt=""
                      draggable={false}
                    />
                  </span>
                  <span className="values-spread__card-pill">{item.pill}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  )
}
