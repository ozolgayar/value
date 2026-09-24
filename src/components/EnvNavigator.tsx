import { asset } from '../asset'
import { envNavigator, type EnvNavCard, type EnvNavItem } from '../data/envNavigator'
import '../styles/env-navigator.css'

function NavItem({ item }: { item: EnvNavItem }) {
  return (
    <li className="en__item">
      {item.href ? (
        <a
          className="en__link"
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {item.label}
        </a>
      ) : (
        <span className="en__label">{item.label}</span>
      )}
      {item.desc ? <span className="en__desc">{item.desc}</span> : null}
    </li>
  )
}

function NavCard({ card }: { card: EnvNavCard }) {
  return (
    <div className="en__card">
      <h2 className="en__card-title">{card.title}</h2>
      <ul className="en__list">
        {card.items.map((item) => (
          <NavItem key={item.label} item={item} />
        ))}
      </ul>
    </div>
  )
}

function Brand({ tone }: { tone: 'light' | 'ink' }) {
  return (
    <div className={`en__brand en__brand--${tone}`}>
      <span>ГЕРОФАРМ</span>
      <span className="en__mark" aria-hidden />
      <span>ТРАНСФОРМАЦИЯ</span>
    </div>
  )
}

export function EnvNavigatorPage() {
  const { badge, title, intro, footnote, leftCards, rightCards, quote } =
    envNavigator

  const [historyCard, missionCard] = leftCards
  const [synergyCard, valuesCard, masteryCard] = rightCards

  return (
    <article className="page-shell page-bleed page-env-navigator">
      <section
        className="en__half en__half--left"
        style={{ backgroundImage: `url(${asset('img/16.png')})` }}
        aria-label={title}
      >
        <div className="en__wash" aria-hidden />
        <div className="en__inner">
          <span className="en__badge">{badge}</span>
          <h1 className="en__title">{title}</h1>
          <p className="en__intro">{intro}</p>

          <div className="en__tree en__tree--pair">
            <div className="en__tree-rail" aria-hidden />
            <div className="en__tree-cards">
              <NavCard card={historyCard} />
              <NavCard card={missionCard} />
            </div>
          </div>

          <div className="en__closing">
            <p className="en__quote">
              {quote.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
            <p className="en__footnote">*{footnote}</p>
          </div>
          <Brand tone="light" />
        </div>
      </section>

      <section
        className="en__half en__half--right"
        style={{ backgroundImage: `url(${asset('img/17.png')})` }}
        aria-label="Инструменты окружения"
      >
        <div className="en__wash" aria-hidden />
        <div className="en__inner en__inner--right">
          <div className="en__tree en__tree--branch">
            <NavCard card={synergyCard} />
            <div className="en__tree-fork" aria-hidden />
            <div className="en__tree-cards">
              <NavCard card={valuesCard} />
              <NavCard card={masteryCard} />
            </div>
          </div>
          <Brand tone="light" />
        </div>
      </section>
    </article>
  )
}
