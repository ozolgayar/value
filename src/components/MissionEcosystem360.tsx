import { useId, useState, type CSSProperties } from 'react'
import { missionEcosystem, type EcoSector } from '../data/missionEco'
import { fixPrepositions } from '../lib/fixPrepositions'
import '../styles/mission-eco.css'

const CX = 500
const CY = 500
const R_INNER = 132
const R_MID = 318
const R_OUTER = 392
const R_PARTNER = 438
const R_LIFE = 148

/** Mid-angles for sectors clockwise from 12 o'clock (SVG: 0° = east). */
const SECTOR_MIDS = [-90, 0, 90, 180]

function polar(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return {
    x: CX + r * Math.cos(rad),
    y: CY + r * Math.sin(rad),
  }
}

function annularSector(r0: number, r1: number, a0: number, a1: number) {
  const sweep = a1 - a0
  const large = sweep > 180 ? 1 : 0
  const p0 = polar(r1, a0)
  const p1 = polar(r1, a1)
  const p2 = polar(r0, a1)
  const p3 = polar(r0, a0)
  return [
    `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}`,
    `A ${r1} ${r1} 0 ${large} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `A ${r0} ${r0} 0 ${large} 0 ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    'Z',
  ].join(' ')
}

function sectorAngles(index: number) {
  const mid = SECTOR_MIDS[index]
  return { a0: mid - 45, a1: mid + 45, mid }
}

function labelStyle(index: number): CSSProperties {
  const mid = SECTOR_MIDS[index]
  const p = polar(R_MID * 0.72 + R_INNER * 0.28, mid)
  return {
    left: `${(p.x / 10).toFixed(2)}%`,
    top: `${(p.y / 10).toFixed(2)}%`,
  }
}

export function MissionEcosystemPage() {
  const data = missionEcosystem
  const uid = useId().replace(/:/g, '')
  const [hovered, setHovered] = useState<string | null>(null)
  const [active, setActive] = useState<EcoSector | null>(null)

  const partnerPathId = `eco360-partner-${uid}`
  const lifePathId = `eco360-life-${uid}`

  return (
    <article className="page-shell page-bleed page-mission-eco">
      <div className="eco360">
        <header className="eco360__head">
          <span className="eco360__badge">{data.badge}</span>
          <h1 className="eco360__title">{fixPrepositions(data.title)}</h1>
        </header>

        <div className="eco360__stage">
          <svg
            className="eco360__svg"
            viewBox="0 0 1000 1000"
            role="img"
            aria-label="Экосистема здорового долголетия 360 градусов"
          >
            <defs>
              <path
                id={partnerPathId}
                d={`M ${polar(R_PARTNER, -160).x} ${polar(R_PARTNER, -160).y} A ${R_PARTNER} ${R_PARTNER} 0 1 1 ${polar(R_PARTNER, 160).x} ${polar(R_PARTNER, 160).y}`}
                fill="none"
              />
              <path
                id={lifePathId}
                d={`M ${polar(R_LIFE, -140).x} ${polar(R_LIFE, -140).y} A ${R_LIFE} ${R_LIFE} 0 1 1 ${polar(R_LIFE, 140).x} ${polar(R_LIFE, 140).y}`}
                fill="none"
              />
            </defs>

            {/* Partnership outer ring */}
            <circle
              className="eco360__partner-ring"
              cx={CX}
              cy={CY}
              r={R_PARTNER}
              fill="none"
            />
            <text className="eco360__partner-text">
              <textPath href={`#${partnerPathId}`} startOffset="50%" textAnchor="middle">
                {`${data.partnership.label.toUpperCase()} — ${data.partnership.text}`}
              </textPath>
            </text>

            {data.partnership.markers.map((marker, i) => {
              const ang = -40 + i * 40
              const p = polar(R_PARTNER, ang)
              return (
                <g key={marker} className="eco360__marker">
                  <circle cx={p.x} cy={p.y} r={5.5} />
                  <text
                    x={p.x}
                    y={p.y - 14}
                    textAnchor="middle"
                    className="eco360__marker-label"
                  >
                    {marker}
                  </text>
                </g>
              )
            })}

            {/* Doctor of future badge on ring */}
            {(() => {
              const p = polar(R_PARTNER, 28)
              return (
                <g className="eco360__partner-badge" transform={`translate(${p.x}, ${p.y})`}>
                  <rect x={-78} y={-16} width={156} height={32} rx={16} />
                  <text y={5} textAnchor="middle">
                    {data.partnership.tag}
                  </text>
                </g>
              )
            })()}

            {/* Four sectors */}
            {data.sectors.map((sector, index) => {
              const { a0, a1 } = sectorAngles(index)
              const isHot = hovered === sector.id || active?.id === sector.id
              const dimmed = Boolean(hovered || active) && !isHot
              return (
                <path
                  key={sector.id}
                  className={`eco360__sector${isHot ? ' is-hot' : ''}${dimmed ? ' is-dim' : ''}`}
                  d={annularSector(R_INNER + 8, R_OUTER, a0, a1)}
                  onMouseEnter={() => setHovered(sector.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() =>
                    setActive((prev) => (prev?.id === sector.id ? null : sector))
                  }
                />
              )
            })}

            {/* Divider rays */}
            {SECTOR_MIDS.map((mid) => {
              const a = mid - 45
              const i = polar(R_INNER + 8, a)
              const o = polar(R_OUTER, a)
              return (
                <line
                  key={`ray-${mid}`}
                  className="eco360__ray"
                  x1={i.x}
                  y1={i.y}
                  x2={o.x}
                  y2={o.y}
                />
              )
            })}

            {/* Center */}
            <circle className="eco360__core" cx={CX} cy={CY} r={R_INNER} />
            <text className="eco360__core-title" x={CX} y={CY - 10} textAnchor="middle">
              {data.center.title}
            </text>
            <text className="eco360__core-sub" x={CX} y={CY + 18} textAnchor="middle">
              {data.center.subtitle}
            </text>

            {/* Life arc */}
            <path
              className="eco360__life-arc"
              d={`M ${polar(R_LIFE, -150).x} ${polar(R_LIFE, -150).y} A ${R_LIFE} ${R_LIFE} 0 1 1 ${polar(R_LIFE, 150).x} ${polar(R_LIFE, 150).y}`}
              fill="none"
            />
            {data.center.lifeArc.map((label, i) => {
              const ang = -120 + i * 80
              const p = polar(R_LIFE, ang)
              return (
                <g key={label} className="eco360__life-node">
                  <circle cx={p.x} cy={p.y} r={4.5} />
                  <text
                    x={p.x}
                    y={p.y + (ang > 20 && ang < 160 ? 16 : -10)}
                    textAnchor="middle"
                  >
                    {label}
                  </text>
                </g>
              )
            })}
          </svg>

          <div className="eco360__labels" aria-hidden={false}>
            {data.sectors.map((sector, index) => {
              const isHot = hovered === sector.id || active?.id === sector.id
              const dimmed = Boolean(hovered || active) && !isHot
              return (
                <div
                  key={sector.id}
                  className={`eco360__label eco360__label--${index}${isHot ? ' is-hot' : ''}${dimmed ? ' is-dim' : ''}`}
                  style={labelStyle(index)}
                  onMouseEnter={() => setHovered(sector.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <button
                    type="button"
                    className="eco360__label-btn"
                    onClick={() =>
                      setActive((prev) => (prev?.id === sector.id ? null : sector))
                    }
                  >
                    <span className="eco360__label-title">
                      {fixPrepositions(sector.title)}
                    </span>
                  </button>
                  <div className="eco360__tags">
                    {sector.tags.map((tag) => (
                      <a
                        key={tag}
                        className="eco360__tag"
                        href="#"
                        onClick={(e) => e.preventDefault()}
                      >
                        {tag}
                      </a>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {active ? (
          <aside className="eco360__card" aria-live="polite">
            <button
              type="button"
              className="eco360__card-close"
              aria-label="Закрыть"
              onClick={() => setActive(null)}
            >
              ×
            </button>
            <h2>{fixPrepositions(active.title)}</h2>
            <p>{fixPrepositions(active.text)}</p>
            <div className="eco360__tags">
              {active.tags.map((tag) => (
                <a
                  key={tag}
                  className="eco360__tag"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  {tag}
                </a>
              ))}
            </div>
          </aside>
        ) : null}

        <p className="eco360__note">{data.note}</p>
      </div>
    </article>
  )
}
