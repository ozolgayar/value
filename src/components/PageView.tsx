import type { BookPage } from '../data/book'
import { asset } from '../asset'
import { CountUp } from './CountUp'
import { HistoryTimeline } from './HistoryTimeline'
import {
  MissionEcosystemPage,
  MissionLongevityPage,
  MissionStatementPage,
} from './MissionEco'
import { getHistoryPage, historyPageCount } from '../data/history'
import { Velaris } from './Velaris'

export function PageView({
  page,
  onGoToSection,
  onGoToPage,
  historyRevealed,
  onHistoryReveal,
  onHistoryAdvance,
  historyHint = false,
}: {
  page: BookPage
  onGoToSection?: (sectionId: string) => void
  onGoToPage?: (pageId: string) => void
  historyRevealed?: Set<number>
  onHistoryReveal?: (index: number) => void
  onHistoryAdvance?: () => void
  historyHint?: boolean
}) {
  if (page.kind === 'ceo') {
    return (
      <article className="page-shell page-bleed page-ceo">
        <div className="page-ceo__media">
          <img
            className="page-ceo__photo"
            src={asset(page.meta?.photo ?? 'img/03.jpg')}
            alt="Петр Родионов и коллега"
          />
        </div>
        <div className="page-ceo__main">
          <div className="page-ceo__main-inner">
            {page.badge && <span className="pill page-badge">{page.badge}</span>}
            {page.title && <h2 className="page-title">{page.title}</h2>}
            <div className="page-ceo__text">
              {page.body?.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            {(page.meta?.name || page.meta?.role) && (
              <footer className="page-ceo__byline">
                {page.meta?.name && <p className="page-ceo__name">{page.meta.name}</p>}
                {page.meta?.role && <p className="page-ceo__role">{page.meta.role}</p>}
              </footer>
            )}
          </div>
        </div>
      </article>
    )
  }

  if (page.kind === 'split') {
    return (
      <article className="page-shell page-bleed page-split">
        <div className="page-split__left">
          <div className="page-split__left-inner">
            {page.title && <h2 className="page-split__title">{page.title}</h2>}
            <div className="page-split__body">
              {page.body?.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>
          {page.meta?.logo && (
            <img
              className="page-split__logo"
              src={asset(page.meta.logo)}
              alt="ГЕРОФАРМ Трансформация"
            />
          )}
        </div>
        <div className="page-split__right">
          <div className="page-split__right-inner">
            {page.sideTitle && <h3 className="page-split__side-title">{page.sideTitle}</h3>}
            {page.sideItems && (
              <ul className="page-split__list">
                {page.sideItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {page.footerSlogan && (
              <>
                <div className="page-split__divider" aria-hidden />
                <p className="page-split__slogan">
                  <span className="page-split__quote-mark" aria-hidden>
                    «
                  </span>
                  {page.footerSlogan.replace(/\n/g, ' ')}
                  <span className="page-split__quote-mark" aria-hidden>
                    »
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      </article>
    )
  }

  if (page.kind === 'route') {
    return (
      <article className="page-shell page-bleed page-route">
        <div className="page-route__left">
          <div className="page-route__left-inner">
            {page.title && <h2 className="page-route__title">{page.title}</h2>}
            <div className="page-route__body">
              {page.body?.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>
        </div>
        <div className="page-route__right">
          <ul className="chapters-timeline">
            {page.routeItems?.map((item, index) => {
              const num = String(index + 1).padStart(2, '0')
              return (
                <li key={item.sectionId}>
                  <button
                    type="button"
                    className="chapter-item"
                    onClick={() =>
                      item.pageId ? onGoToPage?.(item.pageId) : onGoToSection?.(item.sectionId)
                    }
                  >
                    <div className="chapter-spine" aria-hidden>
                      <div className="chapter-dot" />
                      <div className="chapter-connector" />
                    </div>
                    <div className="chapter-card">
                      <div className="chapter-header">
                        <span className="chapter-num">{num}</span>
                        <h3 className="chapter-title">{item.title}</h3>
                      </div>
                      <p className="chapter-desc">{item.desc}</p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
          {page.meta?.logo && (
            <img
              className="page-route__logo"
              src={asset(page.meta.logo)}
              alt="ГЕРОФАРМ Трансформация"
            />
          )}
        </div>
      </article>
    )
  }

  if (page.kind === 'facts') {
    return (
      <article className="page-shell page-bleed page-facts">
        <div className="page-facts__inner">
          {page.badge && <span className="pill page-badge">{page.badge}</span>}
          {page.title && <h2 className="page-title">{page.title}</h2>}
          {page.body && (
            <div className="page-body page-facts__lead">
              {page.body.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          )}
          <ul className="page-facts__grid">
            {page.facts?.map((fact, index) => (
              <li className="page-facts__item" key={`${fact.value}-${fact.label}`}>
                <CountUp
                  className="page-facts__value"
                  value={fact.value}
                  suffix={fact.suffix}
                  prefix={fact.prefix}
                  delay={index * 0.12}
                />
                <span className="page-facts__label">{fact.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </article>
    )
  }

  if (page.kind === 'interstitial') {
    const titleLines = (page.title ?? '').split('\n').filter(Boolean)
    return (
      <article className="page-shell page-bleed page-interstitial">
        <Velaris
          className="page-interstitial__velaris"
          bg="#1a1460"
          colors={['#3B6FD9', '#6B4FE0', '#A855F7', '#C4B5FD']}
          speed={1.35}
          grain={0.18}
        />
        <div className="page-interstitial__inner">
          <h2 className="page-interstitial__title">
            {titleLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
          <div className="page-interstitial__rule" aria-hidden />
          <div className="page-interstitial__body">
            {page.body?.map((p) => {
              const lead = p.match(/^(Миссия|Стратегия)(\s*[—–-]\s*)(.*)$/s)
              return (
                <p key={p.slice(0, 24)}>
                  {lead ? (
                    <>
                      <strong>{lead[1]}</strong>
                      {lead[2]}
                      {lead[3]}
                    </>
                  ) : (
                    p
                  )}
                </p>
              )
            })}
          </div>
          <footer className="page-interstitial__footer">
            <div className="page-interstitial__footer-line" aria-hidden />
            <div className="page-interstitial__brand">
              <span>ГЕРОФАРМ</span>
              {page.meta?.logo && (
                <img src={asset(page.meta.logo)} alt="" aria-hidden />
              )}
              <span>ТРАНСФОРМАЦИЯ</span>
            </div>
          </footer>
        </div>
      </article>
    )
  }

  if (page.kind === 'mission-statement') {
    return <MissionStatementPage />
  }

  if (page.kind === 'mission-ecosystem') {
    return <MissionEcosystemPage />
  }

  if (page.kind === 'mission-longevity') {
    return <MissionLongevityPage />
  }

  if (page.kind === 'history-era') {
    const pageIndex = Number(page.meta?.historyPage ?? 0)
    const historyPage = getHistoryPage(pageIndex)
    return (
      <article className="page-shell page-bleed page-history">
        <HistoryTimeline
          page={historyPage}
          pageCount={historyPageCount}
          revealed={historyRevealed ?? new Set()}
          onReveal={onHistoryReveal ?? (() => {})}
          onAdvance={onHistoryAdvance}
          showHint={historyHint}
        />
      </article>
    )
  }

  if (page.kind === 'section-open') {
    return (
      <article className="page-shell page-bleed page-open">
        <div className="page-open__inner">
          {page.badge && <span className="pill page-badge">{page.badge}</span>}
          {page.title && <h2 className="page-title">{page.title}</h2>}
          <div className="page-body">
            {page.body?.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </article>
    )
  }

  if (page.kind === 'quote') {
    return (
      <article className="page-shell page-bleed page-quote">
        <div className="page-pad">
          {page.badge && <span className="pill page-badge">{page.badge}</span>}
          {page.quote && <blockquote>{page.quote}</blockquote>}
          <div className="page-body">
            {page.body?.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </article>
    )
  }

  if (page.kind === 'timeline') {
    return (
      <article className="page-shell page-bleed page-timeline">
        <div className="page-pad">
          {page.badge && <span className="pill page-badge">{page.badge}</span>}
          {page.title && <h2 className="page-title">{page.title}</h2>}
          <div className="page-body">
            {page.body?.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          {page.years && (
            <div className="timeline">
              {page.years.map((y) => (
                <div className="timeline__item" key={y.year}>
                  <span className="timeline__year">{y.year}</span>
                  <p className="timeline__text">{y.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </article>
    )
  }

  if (page.kind === 'values') {
    return (
      <article className="page-shell page-bleed">
        <div className="page-pad">
          {page.badge && <span className="pill page-badge">{page.badge}</span>}
          {page.title && <h2 className="page-title">{page.title}</h2>}
          <div className="values-grid">
            {page.values?.map((v) => (
              <div className="value-card" key={v.name} style={{ ['--accent' as string]: v.color }}>
                <h3>{v.name}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="page-shell page-bleed">
      <div className="page-pad">
        {page.badge && <span className="pill page-badge">{page.badge}</span>}
        {page.title && <h2 className="page-title">{page.title}</h2>}
        <div className="page-body">
          {page.body?.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </div>
    </article>
  )
}
