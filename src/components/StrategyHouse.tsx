import { useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  House3DCanvas,
  HOUSE_MARKER_ANCHORS,
  type HouseSectionId,
  type MarkerScreenPos,
} from './House3DCanvas'
import {
  missionStrategyHouse,
  type StrategyHouseLevelId,
} from '../data/missionEco'
import { fixPrepositions } from '../lib/fixPrepositions'
import { asset } from '../asset'
import '../styles/strategy-house-3d.css'

const SECTION_IDS: readonly HouseSectionId[] = [
  'foundation',
  'floor1',
  'floor2',
  'floor3',
  'floor4',
  'mission',
]

const BOOK_LEVEL_BY_SECTION: Record<
  Exclude<HouseSectionId, 'mission'>,
  StrategyHouseLevelId
> = {
  foundation: 'foundation',
  floor1: '1',
  floor2: '2',
  floor3: '3',
  floor4: '4',
}

const MISSION_PANEL = {
  title: 'Миссия компании',
  lead: '',
  items: [
    'Создаем инновации для увеличения продолжительности жизни в России и мире',
  ],
  footnotes: [] as string[],
}

type PanelContent = {
  title: string
  lead: string
  items: string[]
  footnotes: string[]
}

function panelForSection(id: HouseSectionId): PanelContent {
  if (id === 'mission') return MISSION_PANEL

  const levelId = BOOK_LEVEL_BY_SECTION[id]
  const level =
    missionStrategyHouse.levels.find((l) => l.id === levelId) ??
    missionStrategyHouse.levels[0]

  return {
    title: level.title,
    lead: level.lead ?? '',
    items: level.items ?? [],
    footnotes:
      levelId === '4' ? [...missionStrategyHouse.footnotes] : [],
  }
}

export function MissionStrategyHousePage() {
  const pointerMask = `url(${asset('icons/pointer.svg')})`
  const rotateMask = `url(${asset('icons/rotate-3d.svg')})`
  const markerRefs = useRef<Map<HouseSectionId, HTMLButtonElement>>(new Map())
  const [selected, setSelected] = useState<HouseSectionId | null>(null)
  const [completed, setCompleted] = useState<Set<string>>(() => new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const panel = useMemo(
    () => (selected ? panelForSection(selected) : null),
    [selected],
  )

  const selectSection = (id: HouseSectionId) => {
    setSelected(id)
    setCompleted((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  const syncMarkers = (next: MarkerScreenPos[]) => {
    for (const marker of next) {
      const el = markerRefs.current.get(marker.id)
      if (!el) continue
      el.style.left = `${marker.x}px`
      el.style.top = `${marker.y}px`
      el.classList.toggle('is-hidden', !marker.visible)
    }
  }

  return (
    <article
      className="page-shell page-bleed page-strategy-house3d"
      style={
        {
          '--sh3d-pointer-mask': pointerMask,
          '--sh3d-rotate-mask': rotateMask,
        } as CSSProperties
      }
    >
      <div className="sh3d">
        <House3DCanvas
          className="sh3d__viewport"
          selected={selected}
          completed={completed}
          sectionIds={SECTION_IDS}
          onSelect={selectSection}
          onMarkersUpdate={syncMarkers}
          onReady={() => setLoading(false)}
          onError={(message) => {
            setError(message)
            setLoading(false)
          }}
        />

        <div className="sh3d__markers" aria-hidden>
          {HOUSE_MARKER_ANCHORS.map(({ id }) => (
            <button
              key={id}
              type="button"
              ref={(node) => {
                if (node) markerRefs.current.set(id, node)
                else markerRefs.current.delete(id)
              }}
              className={`sh3d__pointer${
                selected === id ? ' is-active' : ''
              }${completed.has(id) ? ' is-done' : ''}`}
              tabIndex={-1}
              onClick={() => selectSection(id)}
            >
              <span className="sh3d__pointer-icon" />
            </button>
          ))}
        </div>

        <div className="sh3d__hud">
          <div className="sh3d__intro">
            <h1 className="sh3d__intro-title">
              Стратегия ГЕРОФАРМ 2030
              <br />
              представлена как дом
            </h1>
            <p className="sh3d__intro-body">
              {fixPrepositions(
                'У него есть фундамент, несущие этажи и крыша. Каждый уровень опирается на предыдущий: без прочного фундамента не удержать стены, без стен не поставить крышу.',
              )}
            </p>
          </div>

          <div className="sh3d__rotate-hint">
            <span className="sh3d__rotate-icon" aria-hidden />
            <p>
              Зажмите левую кнопку мыши и перемещайте курсор, чтобы вращать
              модель.
            </p>
          </div>
          <p className="sh3d__guide">Выберите уровень, чтобы узнать подробнее</p>
        </div>

        {loading ? (
          <div className="sh3d__loading" role="status">
            Загрузка 3D-дома…
          </div>
        ) : null}
        {error ? (
          <div className="sh3d__loading" role="alert">
            {error}
          </div>
        ) : null}

        {panel ? (
          <aside className="sh3d__card" aria-live="polite">
            <button
              type="button"
              className="sh3d__card-close"
              aria-label="Закрыть"
              onClick={() => setSelected(null)}
            >
              ×
            </button>
            <p className="sh3d__card-status">
              {selected && completed.has(selected)
                ? 'РАЗДЕЛ ПРОЙДЕН'
                : 'ЗНАКОМСТВО С РАЗДЕЛОМ'}
            </p>
            <h2 className="sh3d__card-title">
              {fixPrepositions(panel.title)}
            </h2>
            {panel.lead ? (
              <p className="sh3d__card-lead">
                {fixPrepositions(panel.lead)}
              </p>
            ) : null}
            {panel.items.length > 0 ? (
              <div className="sh3d__card-list">
                {panel.items.map((item) => (
                  <p key={item}>{fixPrepositions(item)}</p>
                ))}
              </div>
            ) : null}
            {panel.footnotes.length > 0 ? (
              <div className="sh3d__card-notes">
                {panel.footnotes.map((note) => (
                  <p key={note.slice(0, 24)}>{note}</p>
                ))}
              </div>
            ) : null}
          </aside>
        ) : null}
      </div>
    </article>
  )
}
