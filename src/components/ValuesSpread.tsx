import { asset } from '../asset'
import { valuesSpread } from '../data/valuesSpread'
import '../styles/values-spread.css'

export function ValuesSpreadPage() {
  const { left, right } = valuesSpread

  return (
    <article className="page-shell page-bleed page-values-spread">
      <section className="values-spread__half values-spread__half--left" aria-label={left.title}>
        <div className="values-spread__stack">
          <header className="values-spread__hero values-spread__hero--mission">
            <div className="values-spread__inset">
              <span className="values-spread__badge">{left.badge}</span>
              <h1 className="values-spread__hero-title">{left.title}</h1>
            </div>
          </header>
          <div className="values-spread__body">
            <div className="values-spread__inset">
              <ul className="values-spread__bars">
                {left.items.map((item) => (
                  <li key={item.title} className="values-spread__bar-item">
                    <div
                      className="values-spread__bar-head"
                      style={{ ['--bar' as string]: item.bar }}
                    >
                      <h2>{item.title}</h2>
                    </div>
                    <p>{item.text}</p>
                    {'icons' in item && item.icons ? (
                      <div className="values-spread__icons" aria-hidden>
                        {item.icons.map((src) => (
                          <img
                            key={src}
                            className="values-spread__icon"
                            src={asset(src)}
                            alt=""
                            draggable={false}
                          />
                        ))}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-brand">
          <span className="fb-name">ГЕРОФАРМ</span>
          <span className="fb-dot" aria-hidden />
          <span className="fb-sub">ТРАНСФОРМАЦИЯ</span>
        </div>
      </section>

      <section className="values-spread__half values-spread__half--right" aria-label={right.title}>
        <div className="values-spread__stack">
          <header className="values-spread__hero values-spread__hero--chain" aria-hidden />
          <div className="values-spread__body">
            <div className="values-spread__inset">
              <h2 className="values-spread__section-title">{right.title}</h2>
              <ul className="values-spread__links">
                {right.items.map((item) => (
                  <li key={item.name}>
                    <p>
                      <strong>{item.name}</strong> {item.text}
                    </p>
                    <p
                      className={`values-spread__slogan${
                        item.motto === 'passion' ? ' value-motto--passion' : ''
                      }`}
                      style={item.motto === 'passion' ? undefined : { color: item.color }}
                    >
                      {item.slogan}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="values-spread__chain" aria-hidden>
                {right.chain.map((pill, i) => (
                  <div
                    key={pill.label}
                    className={`values-spread__chain-row${i > 0 ? ' is-step' : ''}`}
                  >
                    {i > 0 && <span className="values-spread__chain-arrow">→</span>}
                    <span className="values-spread__pill">{pill.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}
