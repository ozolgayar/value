import { useEffect, useState } from 'react'
import { asset } from '../asset'
import {
  missionLongevity,
  missionStatement,
  missionStrategy,
  missionStrategyRole,
  missionUniqueness,
} from '../data/missionEco'
import { fixPrepositions } from '../lib/fixPrepositions'
import { SectionEndNav } from './SectionEndNav'
import '../styles/mission-eco.css'

export { MissionCircle3DSlide as MissionEcosystemPage } from './MissionCircle3DSlide'
export { MissionCircle3DSlide } from './MissionCircle3DSlide'
export { MissionStrategyHousePage } from './StrategyHouse'

function renderHighlighted(text: string, highlight?: string) {
  const fixed = fixPrepositions(text)
  if (!highlight || !fixed.includes(highlight)) return fixed
  const parts = fixed.split(highlight)
  return (
    <>
      {parts[0]}
      <strong>{highlight}</strong>
      {parts[1]}
    </>
  )
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
        <h2 className="mstmt__title">{fixPrepositions(data.title)}</h2>
        <div className="mstmt__body">
          <span className="mstmt__arrow" aria-hidden>
            →
          </span>
          <div className="mstmt__paras">
            {data.body.map((p, i) => (
              <p key={p.slice(0, 28)}>
                {i === data.body.length - 1
                  ? renderHighlighted(p, data.highlight)
                  : fixPrepositions(p)}
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
      <div className="muniq__inner">
        <div className="muniq__lead">
          <span className="mstmt__badge">{data.badge}</span>
          <h2 className="muniq__title">{fixPrepositions(data.title)}</h2>
        </div>
        <div className="muniq__points">
          {data.points.map((point) => (
            <div className="muniq__point" key={point.title}>
              <span className="muniq__arrow" aria-hidden>
                →
              </span>
              <div className="muniq__point-body">
                <h3 className="muniq__point-title">{fixPrepositions(point.title)}</h3>
                <p className="muniq__point-text">{fixPrepositions(point.text)}</p>
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
      <div className="muniq__photo">
        <img src={asset(data.photo)} alt="" />
        <div className="muniq__we">
          <img src={asset('img/logo_my.png')} alt="Мы" />
        </div>
      </div>
      <SectionEndNav />
    </article>
  )
}

export function MissionLongevityPage() {
  const data = missionLongevity
  const [spread, setSpread] = useState(false)

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setSpread(true))
    })
    return () => window.cancelAnimationFrame(id)
  }, [])

  return (
    <article className="page-shell page-bleed page-mission-panel page-mission-longevity">
      <div className="mlong">
        <div className="mlong__copy">
          <span className="mpanel__badge">{data.badge}</span>
          <h2 className="mpanel__title mpanel__title--long">{data.title}</h2>
          <div className="mpanel__intro">
            {data.body.map((p) => (
              <p key={p.slice(0, 28)}>{p}</p>
            ))}
          </div>
          <ul className="mlong__list">
            {data.items.map((item) => (
              <li key={item.label} className="mlong__item">
                <span className="mlong__icon">
                  <img src={asset(item.icon)} alt="" />
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
        <div className="mlong__collage">
          <div
            className={`mlong__stack${spread ? ' is-spread' : ''}`}
            aria-hidden
          >
            {data.photos.map((src, index) => (
              <figure
                key={src}
                className={`polaroid mlong__shot mlong__shot--${index + 1}`}
              >
                <img src={asset(src)} alt="" draggable={false} />
              </figure>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}

function StrategyBrand({ logo }: { logo: string }) {
  return (
    <footer className="strategy__brand">
      <span>ГЕРОФАРМ</span>
      <img src={asset(logo)} alt="" aria-hidden />
      <span>ТРАНСФОРМАЦИЯ</span>
    </footer>
  )
}

export function MissionStrategySpreadPage() {
  const left = missionStrategy
  const right = missionStrategyRole

  return (
    <article className="page-shell page-bleed page-strategy-spread">
      <div className="strategy__text strategy__text--statement">
        <div className="strategy__lead">
          <span className="strategy__badge">{left.badge}</span>
          <h2 className="strategy__title">{fixPrepositions(left.title)}</h2>
        </div>
        <div className="strategy__copy">
          <h3 className="strategy__subtitle">{fixPrepositions(left.subtitle)}</h3>
          <div className="strategy__body">
            {left.body.map((p) => (
              <p key={p.slice(0, 28)}>{fixPrepositions(p)}</p>
            ))}
          </div>
          <div className="strategy__role">
            <h2 className="strategy__title strategy__title--role">
              {fixPrepositions(right.title)}
            </h2>
            <p className="strategy__intro">{fixPrepositions(right.intro)}</p>
            <ul className="strategy__list">
              {right.items.map((item) => (
                <li key={item} className="strategy__list-item">
                  {fixPrepositions(item)}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <StrategyBrand logo={left.logo} />
      </div>
      <div
        className="strategy__photo"
        style={{ backgroundImage: `url(${asset(left.photo)})` }}
        role="img"
        aria-label="Стратегия ГЕРОФАРМ"
      />
    </article>
  )
}

/** @deprecated */
export function MissionEco() {
  return <MissionStatementPage />
}
