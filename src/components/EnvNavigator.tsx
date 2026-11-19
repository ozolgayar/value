import {
  envNavigator,
  type EnvNavCard,
  type EnvNavItem,
} from '../data/envNavigator'
import { fixPrepositions } from '../lib/fixPrepositions'
import { SectionEndNav } from './SectionEndNav'
import '../styles/env-navigator.css'

function NavItem({ item }: { item: EnvNavItem }) {
  if (item.href) {
    return (
      <li className="en__item">
        <a
          className="en__link"
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="en__link-label">{fixPrepositions(item.label)}</span>
          <span className="en__link-arrow" aria-hidden>
            ↗
          </span>
        </a>
        {item.desc ? (
          <span className="en__desc">{fixPrepositions(item.desc)}</span>
        ) : null}
      </li>
    )
  }

  return (
    <li className="en__item">
      <span className="en__label">{fixPrepositions(item.label)}</span>
      {item.desc ? (
        <span className="en__desc">{fixPrepositions(item.desc)}</span>
      ) : null}
    </li>
  )
}

function NavCard({ card }: { card: EnvNavCard }) {
  return (
    <article
      className={`en__card en__card--${card.accent} en__card--${card.index}`}
      aria-labelledby={`en-card-${card.index}`}
    >
      <header className="en__card-head">
        <span className="en__card-index" aria-hidden>
          {card.index}
        </span>
        <h2 className="en__card-title" id={`en-card-${card.index}`}>
          {fixPrepositions(card.title)}
        </h2>
      </header>
      <ul className="en__list">
        {card.items.map((item) => (
          <NavItem key={item.label} item={item} />
        ))}
      </ul>
    </article>
  )
}

export function EnvNavigatorPage() {
  const { badge, title, intro, footnote, cards } = envNavigator

  return (
    <article className="page-shell page-bleed page-env-navigator">
      <div className="en__shell">
        <div className="en__main">
          <header className="en__hero">
            <div className="en__intro-block">
              <span className="en__badge">{badge}</span>
              <h1 className="en__title">{fixPrepositions(title)}</h1>
              <p className="en__intro">{fixPrepositions(intro)}</p>
            </div>

            <blockquote className="en__lead">
              <p className="en__lead-text">
                <span className="en__lead-line">
                  {fixPrepositions('Каждый день мы можем')}
                </span>
                <span className="en__lead-line">
                  {fixPrepositions('использовать возможности,')}
                </span>
                <span className="en__lead-line">
                  {fixPrepositions('которые компания создаёт')}
                </span>
                <span className="en__lead-line">
                  {fixPrepositions('для нашего успеха')}
                </span>
              </p>
            </blockquote>

            <p className="en__note">
              <span className="en__note-icon" aria-hidden>
                ↗
              </span>
              <span className="en__note-text">{fixPrepositions(footnote)}</span>
            </p>
          </header>

          <section className="en__catalog" aria-label="Каталог окружения">
            {cards.map((card) => (
              <NavCard key={card.index} card={card} />
            ))}
          </section>
        </div>

        <footer className="en__brand">
          <span>ГЕРОФАРМ</span>
          <span className="en__mark" aria-hidden />
          <span>ТРАНСФОРМАЦИЯ</span>
        </footer>
      </div>

      <SectionEndNav />
    </article>
  )
}
