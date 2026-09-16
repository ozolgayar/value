import { asset } from '../asset'
import {
  missionEcosystem,
  missionLongevity,
  missionStatement,
  missionStrategy,
  missionStrategyHouse,
  missionStrategyRole,
  missionUniqueness,
  type EcoBlock,
  type StrategyHouseSection,
} from '../data/missionEco'
import '../styles/mission-eco.css'

function renderHighlighted(text: string, highlight?: string) {
  if (!highlight || !text.includes(highlight)) return text
  const parts = text.split(highlight)
  return (
    <>
      {parts[0]}
      <strong>{highlight}</strong>
      {parts[1]}
    </>
  )
}

function EcoBlockCell({
  block,
  tone,
}: {
  block: EcoBlock | null
  tone: 'light' | 'dark'
}) {
  if (!block) return <div className="ecosystem-block ecosystem-block--empty" aria-hidden />

  return (
    <div className="ecosystem-block">
      <h3 className="block-title">{block.title}</h3>
      <p className="block-text">{block.text}</p>
      {block.links && block.links.length > 0 && (
        <div className="ecosystem-block__links">
          {block.links.map((link) => (
            <a
              key={link.label}
              className={`badge${tone === 'dark' ? ' badge--dark' : ''}`}
              href={link.href || '#'}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                if (!link.href) e.preventDefault()
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function LongevityIcon({ name }: { name: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  switch (name) {
    case 'water':
      return (
        <svg {...common}>
          <path d="M12 3c0 0-5 6.2-5 10a5 5 0 0 0 10 0C17 9.2 12 3 12 3z" />
        </svg>
      )
    case 'sport':
      return (
        <svg {...common}>
          <path d="M6.5 6.5 17.5 17.5" />
          <path d="M9 5H5v4" />
          <path d="M15 19h4v-4" />
          <path d="M17.5 6.5 6.5 17.5" />
        </svg>
      )
    case 'learn':
      return (
        <svg {...common}>
          <path d="M8 21h8" />
          <path d="M12 17v4" />
          <path d="M7 4h10v8a5 5 0 0 1-10 0V4z" />
        </svg>
      )
    case 'pro':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5.5 19c1.6-3 4-4.5 6.5-4.5S16.9 16 18.5 19" />
        </svg>
      )
    case 'social':
      return (
        <svg {...common}>
          <circle cx="9" cy="9" r="2.6" />
          <circle cx="16" cy="10" r="2.2" />
          <path d="M4.5 18c1.2-2.4 2.9-3.5 4.5-3.5s3.3 1.1 4.5 3.5" />
          <path d="M13 18c.7-1.5 1.8-2.3 3-2.3 1.3 0 2.4.8 3.2 2.3" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" />
          <path d="M12 8v5" />
          <path d="M9.5 10.5 12 8l2.5 2.5" />
        </svg>
      )
  }
}

export function MissionStatementPage() {
  const data = missionStatement
  return (
    <article className="page-shell page-bleed page-mission-statement">
      <div
        className="mstmt__photo"
        style={{ backgroundImage: `url(${asset(data.photo)})` }}
        aria-hidden
      />
      <div className="mstmt__veil" aria-hidden />
      <div className="mstmt__inner">
        <span className="mstmt__badge">{data.badge}</span>
        <h2 className="mstmt__title">{data.title}</h2>
        <div className="mstmt__body">
          <span className="mstmt__arrow" aria-hidden>
            →
          </span>
          <div className="mstmt__paras">
            {data.body.map((p, i) => (
              <p key={p.slice(0, 28)}>
                {i === data.body.length - 1
                  ? renderHighlighted(p, data.highlight)
                  : p}
              </p>
            ))}
          </div>
        </div>
        <footer className="mstmt__brand">
          <span>ГЕРОФАРМ</span>
          <img src={asset(data.logo)} alt="" aria-hidden />
          <span>ТРАНСФОРМАЦИЯ</span>
        </footer>
      </div>
    </article>
  )
}

export function MissionUniquenessPage() {
  const data = missionUniqueness

  return (
    <article className="page-shell page-bleed page-mission-uniqueness">
      <div
        className="muniq__photo"
        style={{ backgroundImage: `url(${asset(data.photo)})` }}
        aria-hidden
      />
      <div className="muniq__veil" aria-hidden />
      <div className="muniq__inner">
        <span className="mstmt__badge">{data.badge}</span>
        <h2 className="muniq__title">{data.title}</h2>
        <div className="muniq__points">
          {data.points.map((point) => (
            <div className="muniq__point" key={point.title}>
              <span className="muniq__arrow" aria-hidden>
                →
              </span>
              <div className="muniq__point-body">
                <h3 className="muniq__point-title">{point.title}</h3>
                <p className="muniq__point-text">{point.text}</p>
              </div>
            </div>
          ))}
        </div>
        <footer className="mstmt__brand">
          <span>ГЕРОФАРМ</span>
          <img src={asset(data.logo)} alt="" aria-hidden />
          <span>ТРАНСФОРМАЦИЯ</span>
        </footer>
      </div>
    </article>
  )
}

export function MissionEcosystemPage() {
  const data = missionEcosystem
  const rowCount = Math.max(data.left.length, data.right.length)
  const rows = Array.from({ length: rowCount }, (_, i) => ({
    left: data.left[i] ?? null,
    right: data.right[i] ?? null,
  }))

  return (
    <article className="page-shell page-bleed page-mission-eco">
      <div className="ecosystem-layout">
        <div className="ecosystem-paint ecosystem-paint--left" aria-hidden />
        <div className="ecosystem-paint ecosystem-paint--right" aria-hidden />

        <header className="ecosystem-cell ecosystem-cell--left ecosystem-header">
          <span className="section-label">{data.badge}</span>
          <h1 className="page-title">{data.title}</h1>
        </header>
        <div className="ecosystem-cell ecosystem-cell--right ecosystem-header" aria-hidden />

        {rows.map(({ left, right }) => (
          <div className="ecosystem-row" key={left?.title ?? right?.title}>
            <div className="ecosystem-cell ecosystem-cell--left">
              <EcoBlockCell block={left} tone="light" />
            </div>
            <div className="ecosystem-cell ecosystem-cell--right">
              <EcoBlockCell block={right} tone="dark" />
            </div>
          </div>
        ))}

        <footer className="ecosystem-cell ecosystem-cell--left ecosystem-footer">
          <div className="meco__brand">
            <span>ГЕРОФАРМ</span>
            <span className="meco__mark" aria-hidden />
            <span>ТРАНСФОРМАЦИЯ</span>
          </div>
        </footer>
        <footer className="ecosystem-cell ecosystem-cell--right ecosystem-footer">
          <p className="meco__note">*{data.note}</p>
          <div className="meco__brand meco__brand--ink">
            <span>ГЕРОФАРМ</span>
            <span className="meco__mark" aria-hidden />
            <span>ТРАНСФОРМАЦИЯ</span>
          </div>
        </footer>
      </div>
    </article>
  )
}

export function MissionLongevityPage() {
  const data = missionLongevity
  return (
    <article className="page-shell page-bleed page-mission-panel page-mission-longevity">
      <div className="mpanel__frame">
        <div className="mpanel__head-block">
          <div className="mpanel__top">
            <h2 className="mpanel__title mpanel__title--long">{data.title}</h2>
            <span className="mpanel__badge">{data.badge}</span>
          </div>
          <div className="mpanel__intro">
            {data.body.map((p) => (
              <p key={p.slice(0, 28)}>{p}</p>
            ))}
          </div>
        </div>
        <ul className="mlong__list">
          {data.items.map((item) => (
            <li key={item.label} className="mlong__item">
              <span className="mlong__icon">
                <LongevityIcon name={item.icon} />
              </span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
        <div className="mlong__footer">
          <span className="mlong__hash">{data.hashtag}</span>
          <footer className="mpanel__brand">
            <span>ГЕРОФАРМ</span>
            <img src={asset(data.logo)} alt="" aria-hidden />
            <span>ТРАНСФОРМАЦИЯ</span>
          </footer>
        </div>
      </div>
    </article>
  )
}

export function MissionStrategySpreadPage() {
  const left = missionStrategy
  const right = missionStrategyRole

  return (
    <article className="page-shell page-bleed page-strategy-spread">
      <section className="strategy-spread__half strategy-spread__half--left">
        <div
          className="strategy__photo"
          style={{ backgroundImage: `url(${asset(left.photo)})` }}
          aria-hidden
        />
        <div className="strategy__veil strategy__veil--2030" aria-hidden />
        <div className="strategy__inner">
          <span className="strategy__badge">{left.badge}</span>
          <h2 className="strategy__title">{left.title}</h2>
          <h3 className="strategy__subtitle">{left.subtitle}</h3>
          <div className="strategy__body">
            {left.body.map((p) => (
              <p key={p.slice(0, 28)}>{p}</p>
            ))}
          </div>
          <footer className="strategy__brand">
            <span>ГЕРОФАРМ</span>
            <img src={asset(left.logo)} alt="" aria-hidden />
            <span>ТРАНСФОРМАЦИЯ</span>
          </footer>
        </div>
      </section>

      <section className="strategy-spread__half strategy-spread__half--right">
        <div
          className="strategy__photo"
          style={{ backgroundImage: `url(${asset(right.photo)})` }}
          aria-hidden
        />
        <div className="strategy__veil strategy__veil--role" aria-hidden />
        <div className="strategy__inner strategy__inner--role">
          <div className="strategy__panel">
            <h2 className="strategy__title strategy__title--role">{right.title}</h2>
            <p className="strategy__intro">{right.intro}</p>
            <ul className="strategy__list">
              {right.items.map((item) => (
                <li key={item} className="strategy__list-item">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </article>
  )
}

function StrategyHouseSectionBlock({ section }: { section: StrategyHouseSection }) {
  return (
    <div className="strategy-house__section">
      <h3 className="strategy-house__section-title">{section.title}</h3>
      {section.lead && (
        <p className="strategy-house__section-lead">{section.lead}</p>
      )}
      {section.items && section.items.length > 0 && (
        <ul className="strategy-house__list">
          {section.items.map((item) => (
            <li key={item} className="strategy-house__list-item">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function MissionStrategyHousePage() {
  const data = missionStrategyHouse

  return (
    <article className="page-shell page-bleed page-strategy-house">
      <div
        className="strategy-house__bg"
        style={{ backgroundImage: `url(${asset(data.background)})` }}
        aria-hidden
      />
      <div className="strategy-house__grid">
        <section className="strategy-house__col strategy-house__col--left">
          <div className="strategy-house__veil strategy-house__veil--left" aria-hidden />
          <div className="strategy-house__inner">
            <span className="strategy__badge">{data.badge}</span>
            <h2 className="strategy-house__title">{data.left.title}</h2>
            <div className="strategy-house__intro">
              {data.left.intro.map((p) => (
                <p key={p.slice(0, 28)}>{p}</p>
              ))}
            </div>
            {data.left.sections.map((section) => (
              <StrategyHouseSectionBlock key={section.title} section={section} />
            ))}
            <div className="strategy-house__footnotes">
              {data.left.footnotes.map((note) => (
                <p key={note.slice(0, 24)}>{note}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="strategy-house__col strategy-house__col--right">
          <div className="strategy-house__veil strategy-house__veil--right" aria-hidden />
          <div className="strategy-house__inner strategy-house__inner--right">
            <h2 className="strategy-house__title strategy-house__title--right">
              {data.right.title}
            </h2>
            {data.right.sections.map((section) => (
              <StrategyHouseSectionBlock key={section.title} section={section} />
            ))}
          </div>
        </section>
      </div>
    </article>
  )
}

/** @deprecated */
export function MissionEco() {
  return <MissionStatementPage />
}
