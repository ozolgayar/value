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

export function EnvNavigatorPage() {
  const { badge, title, intro, footnote, leftCards, rightCards, quote } = envNavigator

  return (
    <article className="page-shell page-bleed page-env-navigator">
      <section className="en__half en__half--left" aria-label={title}>
        <div className="en__inner">
          <span className="en__badge">{badge}</span>
          <h1 className="en__title">{title}</h1>
          <p className="en__intro">{intro}</p>
          <div className="en__cards">
            {leftCards.map((card) => (
              <NavCard key={card.title} card={card} />
            ))}
          </div>
          <p className="en__footnote">*{footnote}</p>
        </div>
      </section>

      <section className="en__half en__half--right" aria-label="Инструменты окружения">
        <div className="en__inner en__inner--right">
          <div className="en__cards en__cards--right">
            {rightCards.map((card) => (
              <NavCard key={card.title} card={card} />
            ))}
            <p className="en__quote">{quote}</p>
          </div>
        </div>
      </section>
    </article>
  )
}
