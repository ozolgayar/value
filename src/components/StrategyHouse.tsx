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
import { SectionEndNav } from './SectionEndNav'
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

/** Marker order for progressive house-icon fill (foundation → floor 4). */
const MARKER_ORDER: HouseZoneId[] = ['foundation', '1', '2', '3', '4']

const FLOOR_TOOLTIP: Record<HouseZoneId, string> = {
  mission: 'Миссия компании',
  '4': '4 этаж · Финансовые показатели',
  '3': '3 этаж · Портфель и рынки',
  '2': '2 этаж · Бизнес-процессы и производство',
  '1': '1 этаж · Персонал',
  foundation: 'Фундамент · Ценности ГЕРОФАРМ',
}

const DESKTOP_GUIDE_START =
  'Посмотри все этажи дома, чтобы узнать о стратегии подробнее. Нажми на мигающий фундамент'
const DESKTOP_GUIDE_AFTER =
  'Нажимай на мигающий этаж, чтобы узнать о стратегии'
const DESKTOP_GUIDE_DONE =
  'Отлично! Ты посмотрел все этажи. Теперь ты знаешь всё о нашей стратегии!'
const FLOOR_HINT_START =
  'Нажми на иконку домика, чтобы открыть описание его этажей'
const FLOOR_HINT_AFTER =
  'Иконка домика указывает, где находится каждый этаж'

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
  lead: 'Создаем инновации для увеличения продолжительности жизни в России и мире',
}

type PanelLevel = {
  title: string
  lead?: string
  items?: string[]
}

export function MissionStrategyHousePage() {
  const data = missionStrategyHouse
  const baseId = useId().replace(/:/g, '')
  const panelRef = useRef<HTMLElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<HouseZoneId>('foundation')
  const [visited, setVisited] = useState<Set<HouseZoneId>>(() => new Set())
  const [isMobileLayout, setIsMobileLayout] = useState(false)
  const [mobileIntroDone, setMobileIntroDone] = useState(false)
  const [floorsOpened, setFloorsOpened] = useState(false)

  const level: PanelLevel =
    active === 'mission'
      ? MISSION_LEVEL
      : (data.levels.find((l) => l.id === active) ?? data.levels[0])

  const tabpanelId = `${baseId}-panel`
  const showFootnotes = active === '4'
  const floorIndex = Math.max(0, LEVEL_ORDER.indexOf(active))
  const floorTotal = LEVEL_ORDER.length
  const floorLabel = `Этаж ${floorIndex + 1} из ${floorTotal}`
  const canGoPrev = floorIndex > 0
  const canGoNext = floorIndex < floorTotal - 1
  const mobileFloorHint = floorsOpened ? FLOOR_HINT_AFTER : FLOOR_HINT_START
  const allFloorsVisited = LEVEL_ORDER.every((id) => visited.has(id))
  const desktopGuide = !floorsOpened
    ? DESKTOP_GUIDE_START
    : allFloorsVisited
      ? DESKTOP_GUIDE_DONE
      : DESKTOP_GUIDE_AFTER
  const inviteFloorId = !isMobileLayout
    ? !floorsOpened
      ? 'foundation'
      : (LEVEL_ORDER.find((id) => !visited.has(id)) ?? null)
    : null

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
  const progress = floorsOpened
    ? Math.max(
        iconFill,
        isMobileLayout
          ? (maxReached + 1) / floorTotal
          : maxReached / Math.max(1, LEVEL_ORDER.length - 1),
      )
    : 0

  useEffect(() => {
    // Match Reader `isMobile` / vertical track breakpoint.
    const mq = window.matchMedia('(max-width: 860px)')
    const sync = () => setIsMobileLayout(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const selectLevel = (id: HouseZoneId) => {
    setActive(id)
    setVisited((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  const selectDesktopLevel = (id: HouseZoneId) => {
    if (!floorsOpened) {
      // First click must open the foundation invite.
      if (id !== 'foundation') return
      setFloorsOpened(true)
      selectLevel('foundation')
      return
    }
    selectLevel(id)
  }

  const scrollToDetail = () => {
    const target = detailRef.current
    if (!target) return
    const page = target.closest('.reader__page') as HTMLElement | null
    if (!page) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      return
    }
    const topbar = document.querySelector(
      '.reader__topbar',
    ) as HTMLElement | null
    const offset = topbar
      ? Math.ceil(topbar.getBoundingClientRect().height) + 8
      : 64
    const nextTop =
      page.scrollTop +
      (target.getBoundingClientRect().top - page.getBoundingClientRect().top) -
      offset
    page.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' })
  }

  const openFloors = (id: HouseZoneId = 'foundation') => {
    const firstOpen = !floorsOpened
    // First tap always opens the foundation, even if the hit target was another floor.
    setFloorsOpened(true)
    selectLevel(firstOpen ? 'foundation' : id)
    if (firstOpen) {
      window.requestAnimationFrame(() => scrollToDetail())
    }
  }

  const goPrevFloor = () => {
    if (!canGoPrev) return
    selectLevel(LEVEL_ORDER[floorIndex - 1])
  }

  const goNextFloor = () => {
    if (!floorsOpened) {
      openFloors('foundation')
      return
    }
    if (!canGoNext) return
    selectLevel(LEVEL_ORDER[floorIndex + 1])
  }

  const onMobileHotspotKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      goNextFloor()
      return
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      goPrevFloor()
      return
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openFloors(active)
    }
  }

  const enterStrategy = () => {
    setMobileIntroDone(true)
    window.dispatchEvent(new CustomEvent('gph:clear-toast'))
    // Do NOT use scrollIntoView here — it scrolls outer containers and lifts
    // the reader chrome (page counter) off the bottom of the viewport.
    window.requestAnimationFrame(() => {
      const page = stageRef.current?.closest(
        '.reader__page',
      ) as HTMLElement | null
      if (page) page.scrollTop = 0
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    })
  }

  useEffect(() => {
    if (!isMobileLayout || mobileIntroDone) return
    window.dispatchEvent(
      new CustomEvent('gph:toast', {
        detail: 'Нажми кнопку «Перейти к стратегии»',
      }),
    )
  }, [isMobileLayout, mobileIntroDone])

  const activeTooltip = FLOOR_TOOLTIP[active]
  const showMobileDetail = floorsOpened
  const articleClass = [
    'page-shell',
    'page-bleed',
    'page-strategy-house',
    isMobileLayout
      ? mobileIntroDone
        ? 'is-strategy-ready'
        : 'is-strategy-intro'
      : '',
    isMobileLayout && floorsOpened ? 'is-floors-open' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const floorDetail = (
    <div key={active} className="shouse__panel-body-inner">
      <h2 className="shouse__panel-title">{fixPrepositions(level.title)}</h2>
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
  )

  const floorStepper = (
    <div
      className="shouse__floor-stepper"
      role="group"
      aria-label="Навигация по этажам"
    >
      <button
        type="button"
        className="shouse__floor-step-btn"
        onClick={goPrevFloor}
        disabled={!canGoPrev}
      >
        Назад
      </button>
      <div className="shouse__floor-step-meta">
        <span className="shouse__floor-step-count">{floorLabel}</span>
        <div className="shouse__floor-step-progress" aria-hidden>
          <i
            style={{
              width: `${((floorIndex + 1) / floorTotal) * 100}%`,
            }}
          />
        </div>
      </div>
      <button
        type="button"
        className="shouse__floor-step-btn shouse__floor-step-btn--next"
        onClick={goNextFloor}
        disabled={!canGoNext}
      >
        Далее
      </button>
    </div>
  )

  return (
    <article className={articleClass}>
      <div
        className={`shouse${inviteFloorId ? ' is-invite-floor' : ''}`}
        style={
          {
            '--sh-progress': String(progress),
            '--sh-icon-fill': String(iconFill),
          } as CSSProperties
        }
      >
        <section
          className="shouse__mobile-intro"
          aria-label="Введение в стратегию"
        >
          <div className="shouse__mobile-intro-inner">
            <p className="shouse__title">{fixPrepositions(data.title)}</p>
            <p className="shouse__intro">{fixPrepositions(data.intro)}</p>
            <button
              type="button"
              className="shouse__mobile-intro-cta"
              onClick={enterStrategy}
            >
              Перейти к стратегии
            </button>
          </div>
        </section>

        <div className="shouse__main">
          <div className="shouse__stage" ref={stageRef}>
            <div
              className="shouse__figure"
              onClick={
                isMobileLayout
                  ? (e) => {
                      if ((e.target as Element).closest('.shouse__hotspot'))
                        return
                      openFloors(floorsOpened ? active : 'foundation')
                    }
                  : undefined
              }
              role="presentation"
            >
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
                  {FLOOR_POLYS.map((floor) => {
                    const isInvite = inviteFloorId === floor.id
                    // Only the next invite floor glows — never keep a viewed floor lit
                    // (including mission after the user has opened it).
                    const isActive =
                      floorsOpened &&
                      active === floor.id &&
                      !visited.has(floor.id) &&
                      (!inviteFloorId || isInvite)
                    return (
                    <polygon
                      key={floor.id}
                      className={`floor-poly${isActive ? ' active' : ''}${
                        isInvite ? ' is-invite' : ''
                      }`}
                      points={floor.points}
                      onClick={(e) => {
                        if (isMobileLayout) {
                          e.stopPropagation()
                          openFloors(floor.id)
                          return
                        }
                        selectDesktopLevel(floor.id)
                      }}
                    >
                      <title>{floor.title}</title>
                    </polygon>
                    )
                  })}
                </svg>

                {isMobileLayout ? (
                  <div className="shouse__tablist">
                    <button
                      id={`${baseId}-tab-active`}
                      type="button"
                      className={`shouse__hotspot shouse__hotspot--${active} is-active`}
                      aria-controls={tabpanelId}
                      title={activeTooltip}
                      onClick={(e) => {
                        e.stopPropagation()
                        openFloors(floorsOpened ? active : 'foundation')
                      }}
                      onKeyDown={onMobileHotspotKeyDown}
                    >
                      <span className="shouse__hotspot-num">
                        <HouseProgressIcon
                          fill={iconFill}
                          clipId={`${baseId}-house-clip-active`}
                        />
                      </span>
                      <span className="shouse__tooltip" aria-hidden>
                        {activeTooltip}
                      </span>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="shouse__mobile-floors">
          <p
            className="shouse__mobile-floors-label"
            id={`${baseId}-mobile-floors`}
          >
            Этажи стратегии
          </p>
          <p className="shouse__mobile-floors-hint">{mobileFloorHint}</p>
        </div>

        <aside
          ref={panelRef}
          className="shouse__panel"
          id={tabpanelId}
          role="region"
          tabIndex={-1}
          aria-labelledby={
            isMobileLayout ? `${baseId}-tab-active` : undefined
          }
          aria-label={isMobileLayout ? undefined : level.title}
        >
          <div className="shouse__panel-head">
            <p className="shouse__title">{fixPrepositions(data.title)}</p>
            <p className="shouse__intro">{fixPrepositions(data.intro)}</p>
          </div>

          {isMobileLayout ? (
            showMobileDetail ? (
              <div
                ref={detailRef}
                className="shouse__panel-body is-open"
                id={`${baseId}-floor-detail`}
              >
                {floorDetail}
                {floorStepper}
              </div>
            ) : null
          ) : (
            <>
              {floorsOpened ? (
                <div
                  ref={detailRef}
                  className="shouse__panel-body"
                  id={`${baseId}-floor-detail`}
                >
                  {floorDetail}
                </div>
              ) : null}
              <div
                className={`shouse__guide-card${
                  allFloorsVisited ? ' is-done' : ''
                }`}
                role="status"
              >
                {allFloorsVisited ? (
                  <span className="shouse__guide-card-check" aria-hidden>
                    <svg viewBox="0 0 24 24" width="22" height="22">
                      <circle cx="12" cy="12" r="11" fill="currentColor" />
                      <path
                        d="M7.2 12.4l3 3 6.6-6.8"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                ) : null}
                <p className="shouse__guide-card-text">{desktopGuide}</p>
              </div>
            </>
          )}
        </aside>
      </div>
      {allFloorsVisited ? <SectionEndNav /> : null}
    </article>
  )
}
