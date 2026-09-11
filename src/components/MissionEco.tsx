import { asset } from '../asset'
import {
  missionEcosystem,
  missionLongevity,
  missionStatement,
  type EcoBlock,
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

function EcoBlocks({ blocks }: { blocks: EcoBlock[] }) {
  return (
    <div className="meco__blocks">
      {blocks.map((block) => (
        <div className="meco__block" key={block.title}>
          <h3 className="meco__block-title">{block.title}</h3>
          <p className="meco__block-text">{block.text}</p>
          {block.links && block.links.length > 0 && (
            <div className="meco__links">
              {block.links.map((link) => (
                <a
                  key={link.label}
                  className={`meco__link meco__link--${link.kind ?? 'chip'}`}
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
      ))}
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

export function MissionEcosystemPage() {
  const data = missionEcosystem
  return (
    <article className="page-shell page-bleed page-mission-eco">
      <div className="meco__left">
        <div className="meco__left-top">
          <h2 className="meco__title">{data.title}</h2>
          <span className="meco__badge">{data.badge}</span>
        </div>
        <EcoBlocks blocks={data.left} />
        <footer className="meco__brand">
          <span>ГЕРОФАРМ</span>
          <img src={asset(data.logo)} alt="" aria-hidden />
          <span>ТРАНСФОРМАЦИЯ</span>
        </footer>
      </div>
      <div className="meco__right">
        <EcoBlocks blocks={data.right} />
        <p className="meco__note">*{data.note}</p>
        <footer className="meco__brand meco__brand--ink">
          <span>ГЕРОФАРМ</span>
          <img src={asset(data.logo)} alt="" aria-hidden />
          <span>ТРАНСФОРМАЦИЯ</span>
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
        <div className="mpanel__top">
          <h2 className="mpanel__title mpanel__title--long">{data.title}</h2>
          <span className="mpanel__badge">{data.badge}</span>
        </div>
        <div className="mpanel__intro">
          {data.body.map((p) => (
            <p key={p.slice(0, 28)}>{p}</p>
          ))}
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

/** @deprecated */
export function MissionEco() {
  return <MissionStatementPage />
}
