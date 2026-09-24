import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'
import { asset } from '../asset'
import {
  missionStrategyHouse,
  type StrategyHouseLevelId,
} from '../data/missionEco'
import { fixPrepositions } from '../lib/fixPrepositions'
import '../styles/mission-eco.css'

/** Zones from the SVG map (img/15.png is 6000×4200). */
type HouseZoneId = StrategyHouseLevelId | 'mission'

const LEVEL_ORDER: HouseZoneId[] = [
  'foundation',
  '1',
  '2',
  '3',
  '4',
  'mission',
]

type FloorPoly = {
  id: HouseZoneId
  points: string
  title: string
}

/** Polygon coords from the floor map (viewBox 0 0 6000 4200). */
const FLOOR_POLYS: FloorPoly[] = [
  {
    id: 'foundation',
    title: 'Фундамент (ценности)',
    points:
      '1368,3114 4028,3510 5072,3098 5060,2926 4048,3334 1384,2938',
  },
  {
    id: '1',
    title: 'Этаж 1',
    points:
      '1598,2367 1601,2856 1400,2928 4040,3318 5051,2922 4973,2904 4964,2418 4151,2697',
  },
  {
    id: '2',
    title: 'Этаж 2',
    points:
      '1211,2319 4151,2679 5021,2391 5018,2343 4955,2334 4949,2235 4778,2226 4793,1923 4844,1905 4835,1863 4343,1998 3350,1890 2936,2016 1214,1812 1208,1866 1280,1872 1274,2250 1220,2265',
  },
  {
    id: '3',
    title: 'Этаж 3',
    points:
      '1574,1629 1283,1704 1271,1803 2915,2001 3341,1875 4343,1989 4787,1851 4796,1767 3869,1653 3857,1482 3908,1461 3899,1416 3864,1390 3924,1378 3928,1327 3486,1438 3400,1427 3353,1439 2369,1330 2357,1275 2328,1271 2197,1300 2035,1264 2031,1139 2029,1121 1511,1230',
  },
  {
    id: '4',
    title: 'Этаж 4',
    points:
      '1967,891 1965,941 2033,939 2037,1257 2196,1293 2309,1269 2358,1266 2373,1321 3350,1428 3392,1420 3482,1431 3906,1324 3898,1225 3822,1212 3822,956 3884,945 3880,909 3370,1023',
  },
  {
    id: 'mission',
    title: 'Миссия (с лого ГЕРОФАРМ)',
    points:
      '1905,750 1905,885 3367,1014 3939,891 3939,759 3795,592 3646,580 3518,569 3417,563 3240,544 3062,528 2824,513 2694,500 2612,494 2464,495 2430,434 2353,412 2293,421 2241,472 2223,473 2202,442 2157,424 2113,433 2053,459 2029,529 2043,597 2077,634 2124,652 2167,640 2218,619 2229,607 2244,640 2268,666 2280,675',
  },
]

type Hotspot = {
  id: HouseZoneId
  tooltip: string
}

/** Marker order for progressive house-icon fill (foundation → floor 4). */
const MARKER_ORDER: HouseZoneId[] = ['foundation', '1', '2', '3', '4']

const HOTSPOTS: Hotspot[] = [
  {
    id: 'mission',
    tooltip: 'Миссия компании',
  },
  {
    id: '4',
    tooltip: '4 этаж · Финансовые показатели',
  },
  {
    id: '3',
    tooltip: '3 этаж · Портфель и рынки',
  },
  {
    id: '2',
    tooltip: '2 этаж · Бизнес-процессы и производство',
  },
  {
    id: '1',
    tooltip: '1 этаж · Персонал',
  },
  {
    id: 'foundation',
    tooltip: 'Фундамент · Ценности ГЕРОФАРМ',
  },
]

/** Lucide-style house paths (from icons/house.svg). */
const HOUSE_PATH_ROOF =
  'M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'
const HOUSE_PATH_DOOR = 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8'

function HouseProgressIcon({
  fill,
  clipId,
}: {
  fill: number
  clipId: string
}) {
  const clamped = Math.min(1, Math.max(0, fill))
  const top = 24 * (1 - clamped)

  return (
    <svg
      className="shouse__house-icon"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y={top} width="24" height={24 * clamped} />
        </clipPath>
      </defs>
      {/* Gray silhouette */}
      <path
        className="shouse__house-base"
        fill="currentColor"
        d={HOUSE_PATH_ROOF}
      />
      <path
        className="shouse__house-base-door"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d={HOUSE_PATH_DOOR}
      />
      {/* Blue fill rising from the bottom */}
      <g clipPath={`url(#${clipId})`}>
        <path
          className="shouse__house-fill"
          fill="currentColor"
          d={HOUSE_PATH_ROOF}
        />
        <path
          className="shouse__house-fill-door"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          d={HOUSE_PATH_DOOR}
        />
      </g>
    </svg>
  )
}

const MISSION_LEVEL = {
  id: 'mission' as const,
  title: 'Миссия компании',
  lead: '',
  items: [
    'Создаем инновации для увеличения продолжительности жизни в России и мире',
  ],
}

type PanelLevel = {
  title: string
  lead?: string
  items?: string[]
}

export function MissionStrategyHousePage() {
  const data = missionStrategyHouse
  const baseId = useId().replace(/:/g, '')
  const panelRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<HouseZoneId>('foundation')
  const [visited, setVisited] = useState<Set<HouseZoneId>>(
    () => new Set(['foundation']),
  )
  const [pulse, setPulse] = useState(true)

  const level: PanelLevel =
    active === 'mission'
      ? MISSION_LEVEL
      : (data.levels.find((l) => l.id === active) ?? data.levels[0])

  const tabpanelId = `${baseId}-panel`
  const showFootnotes = active === '4'
  const maxMarkerReached = Math.max(
    -1,
    ...[...visited]
      .map((id) => MARKER_ORDER.indexOf(id))
      .filter((i) => i >= 0),
  )
  const iconFill =
    maxMarkerReached < 0 ? 0 : (maxMarkerReached + 1) / MARKER_ORDER.length
  const maxReached = Math.max(
    0,
    ...[...visited].map((id) => LEVEL_ORDER.indexOf(id)),
  )
  const progress = Math.max(
    iconFill,
    maxReached / Math.max(1, LEVEL_ORDER.length - 1),
  )

  useEffect(() => {
    const id = window.setTimeout(() => setPulse(false), 1000)
    return () => window.clearTimeout(id)
  }, [])

  const selectLevel = (id: HouseZoneId, opts?: { scroll?: boolean }) => {
    setActive(id)
    setVisited((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
    if (opts?.scroll && window.matchMedia('(max-width: 900px)').matches) {
      window.requestAnimationFrame(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  const onTabKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    id: HouseZoneId,
  ) => {
    const navOrder = HOTSPOTS.map((h) => h.id)
    const idx = navOrder.indexOf(id)
    if (idx < 0) return

    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      next = (idx + 1) % navOrder.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      next = (idx - 1 + navOrder.length) % navOrder.length
    } else if (e.key === 'Home') {
      next = 0
    } else if (e.key === 'End') {
      next = navOrder.length - 1
    } else {
      return
    }

    e.preventDefault()
    const nextId = navOrder[next]
    selectLevel(nextId)
    const btn = e.currentTarget
      .closest('[role="tablist"]')
      ?.querySelector<HTMLButtonElement>(`#${baseId}-tab-${nextId}`)
    btn?.focus()
  }

  return (
    <article className="page-shell page-bleed page-strategy-house">
      <div
        className={`shouse${pulse ? ' is-pulse' : ''}`}
        style={
          {
            '--sh-progress': String(progress),
            '--sh-icon-fill': String(iconFill),
          } as CSSProperties
        }
      >
        <div className="shouse__main">
          <div className="shouse__stage">
            <div className="shouse__figure">
              <div className="shouse__map">
                <img
                  className="shouse__img"
                  src={asset(data.houseImage)}
                  alt="Стратегия ГЕРОФАРМ 2030 — дом"
                  draggable={false}
                />

                <svg
                  className="shouse__svg"
                  viewBox="0 0 6000 4200"
                  preserveAspectRatio="xMidYMid meet"
                  aria-hidden
                >
                  <rect
                    className="veil"
                    x="0"
                    y="0"
                    width="6000"
                    height="4200"
                  />
                  {FLOOR_POLYS.map((floor) => (
                    <polygon
                      key={floor.id}
                      className={`floor-poly${
                        active === floor.id ? ' active' : ''
                      }`}
                      points={floor.points}
                      onClick={() => selectLevel(floor.id, { scroll: true })}
                    >
                      <title>{floor.title}</title>
                    </polygon>
                  ))}
                </svg>

                <div
                  className="shouse__tablist"
                  role="tablist"
                  aria-label="Уровни стратегии"
                  aria-orientation="vertical"
                >
                  {HOTSPOTS.map((spot) => {
                    const selected = active === spot.id
                    return (
                      <button
                        key={spot.id}
                        id={`${baseId}-tab-${spot.id}`}
                        type="button"
                        role="tab"
                        className={`shouse__hotspot shouse__hotspot--${spot.id}${
                          selected ? ' is-active' : ''
                        }`}
                        aria-selected={selected}
                        aria-controls={tabpanelId}
                        tabIndex={selected ? 0 : -1}
                        title={spot.tooltip}
                        onClick={() => selectLevel(spot.id, { scroll: true })}
                        onKeyDown={(e) => onTabKeyDown(e, spot.id)}
                      >
                        <span className="shouse__hotspot-num">
                          <HouseProgressIcon
                            fill={iconFill}
                            clipId={`${baseId}-house-clip-${spot.id}`}
                          />
                        </span>
                        <span className="shouse__tooltip" aria-hidden>
                          {spot.tooltip}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside
          ref={panelRef}
          className="shouse__panel"
          id={tabpanelId}
          role="tabpanel"
          tabIndex={-1}
          aria-labelledby={`${baseId}-tab-${active}`}
        >
          <span className="shouse__badge">{data.badge}</span>
          <p className="shouse__intro">{fixPrepositions(data.intro)}</p>
          <p className="shouse__guide">
            Посмотри все этажи дома, чтобы узнать о стратегии подробнее
          </p>

          <div key={active} className="shouse__panel-body">
            <h2 className="shouse__panel-title">
              {fixPrepositions(level.title)}
            </h2>
            {level.lead ? (
              <p className="shouse__panel-lead">{fixPrepositions(level.lead)}</p>
            ) : null}
            {level.items && level.items.length > 0 ? (
              <ul className="shouse__list">
                {level.items.map((item) => (
                  <li key={item}>{fixPrepositions(item)}</li>
                ))}
              </ul>
            ) : null}
            {showFootnotes ? (
              <div className="shouse__footnotes">
                {data.footnotes.map((note) => (
                  <p key={note.slice(0, 24)}>{note}</p>
                ))}
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </article>
  )
}
