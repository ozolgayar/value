import type { BookPage } from '../data/book'
import { asset } from '../asset'
import { fixPrepositions } from '../lib/fixPrepositions'
import { CountUp } from './CountUp'
import { HistoryTimeline } from './HistoryTimeline'
import {
  MissionEcosystemPage,
  MissionLongevityPage,
  MissionStatementPage,
  MissionStrategyHousePage,
  MissionStrategySpreadPage,
  MissionUniquenessPage,
} from './MissionEco'
import { ValuesSpreadPage } from './ValuesSpread'
import { ValueAmbitionPage } from './ValueAmbition'
import { ValuePassionPage } from './ValuePassion'
import { ValueResponsibilityPage } from './ValueResponsibility'
import { EnvNavigatorPage } from './EnvNavigator'
import { MasteryPutinPage } from './MasteryPutin'
import { MasterySemavicPage } from './MasterySemavic'
import { MasteryThirdLinePage } from './MasteryThirdLine'
import { MasteryVenezuelaPage } from './MasteryVenezuela'
import { PracticeAiPage } from './PracticeAi'
import { PracticeBureaucracyPage } from './PracticeBureaucracy'
import { ClosingCoverPage } from './ClosingCover'
import { PracticeEquipmentPage } from './PracticeEquipment'
import { PracticeErrorFirstPage } from './PracticeErrorFirst'
import { PracticeHabitsPage } from './PracticeHabits'
import { PracticeLongTermPage } from './PracticeLongTerm'
import { PracticeMarketPage } from './PracticeMarket'
import { PracticeMethodologyPage } from './PracticeMethodology'
import { PracticeModernizationPage } from './PracticeModernization'
import { PracticeWeeksPage } from './PracticeWeeks'
import { getHistoryPage, historyPageCount } from '../data/history'
import { Velaris } from './Velaris'

export function PageView({
  page,
  onGoToSection,
  onGoToPage,
  historyRevealed,
  onHistoryReveal,
  onHistoryAdvance,
  onHistoryJumpYear,
  historyJumpYear = null,
  onHistoryJumpYearHandled,
  historyHint = false,
}: {
  page: BookPage
  onGoToSection?: (sectionId: string) => void
  onGoToPage?: (pageId: string) => void
  historyRevealed?: Set<number>
  onHistoryReveal?: (index: number) => void
  onHistoryAdvance?: () => void
  onHistoryJumpYear?: (year: string) => void
  historyJumpYear?: string | null
  onHistoryJumpYearHandled?: () => void
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
            {page.title && <h2 className="page-title">{fixPrepositions(page.title)}</h2>}
            <div className="page-ceo__text">
              {page.body?.map((p) => (
                <p key={p.slice(0, 24)}>{fixPrepositions(p)}</p>
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
            {page.title && (
              <h2 className="page-split__title">{fixPrepositions(page.title)}</h2>
            )}
            <div className="page-split__body">
              {page.body?.map((p) => (
                <p key={p.slice(0, 24)}>{fixPrepositions(p)}</p>
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
                  {page.footerSlogan.replace(/\n/g, ' ')}
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
            {page.title && (
              <h2 className="page-route__title">{fixPrepositions(page.title)}</h2>
            )}
            <div className="page-route__body">
              {page.body?.map((p) => (
                <p key={p.slice(0, 24)}>{fixPrepositions(p)}</p>
              ))}
            </div>
          </div>
        </div>
        <div className="page-route__right">
          <div className="page-route__toc">
            <h2 className="page-route__toc-title">Содержание путеводителя</h2>
            <p className="page-route__toc-hint">Выбери раздел или листай дальше</p>
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
          </div>
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
          {page.title && <h2 className="page-title">{fixPrepositions(page.title)}</h2>}
          {page.body && (
            <div className="page-body page-facts__lead">
              {page.body.map((p) => (
                <p key={p.slice(0, 24)}>{fixPrepositions(p)}</p>
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
    const theme = page.meta?.theme
    const velarisBg = page.meta?.bg ?? '#1a1460'
    const velarisColors = page.meta?.colors
      ? page.meta.colors.split(',').map((c) => c.trim())
      : ['#3B6FD9', '#6B4FE0', '#A855F7', '#C4B5FD']

    return (
      <article
        className={`page-shell page-bleed page-interstitial${
          theme ? ` page-interstitial--${theme}` : ''
        }`}
      >
        <Velaris
          className="page-interstitial__velaris"
          bg={velarisBg}
          colors={velarisColors}
          speed={
            theme === 'values' ||
            theme === 'mastery' ||
            theme === 'environment' ||
            theme === 'practice'
              ? 1.55
              : 1.35
          }
          grain={
            theme === 'values' ||
            theme === 'mastery' ||
            theme === 'environment' ||
            theme === 'practice'
              ? 0.14
              : 0.18
          }
        />
        <div className="page-interstitial__inner">
          {(theme === 'synergy' ||
            theme === 'values' ||
            theme === 'mastery' ||
            theme === 'environment' ||
            theme === 'practice') && (
            <div className="page-interstitial__top-line" aria-hidden />
          )}
          <h2 className="page-interstitial__title">
            {titleLines.map((line) => (
              <span key={line}>{fixPrepositions(line)}</span>
            ))}
          </h2>
          <div className="page-interstitial__rule" aria-hidden />
          <div className="page-interstitial__body">
            {page.body?.map((p) => {
              const fixed = fixPrepositions(p)
              const lead = fixed.match(/^(Миссия|Стратегия)(\s*[—–-]\s*)(.*)$/s)
              return (
                <p key={p.slice(0, 24)}>
                  {lead ? (
                    <>
                      <strong>{lead[1]}</strong>
                      {lead[2]}
                      {lead[3]}
                    </>
                  ) : (
                    fixed
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

  if (page.kind === 'mission-strategy-spread') {
    return <MissionStrategySpreadPage />
  }

  if (page.kind === 'mission-strategy-house') {
    return <MissionStrategyHousePage />
  }

  if (page.kind === 'mission-uniqueness') {
    return <MissionUniquenessPage />
  }

  if (page.kind === 'values-spread') {
    return <ValuesSpreadPage />
  }

  if (page.kind === 'value-ambition') {
    return <ValueAmbitionPage />
  }

  if (page.kind === 'value-passion') {
    return <ValuePassionPage />
  }

  if (page.kind === 'value-responsibility') {
    return <ValueResponsibilityPage />
  }

  if (page.kind === 'mastery-semavic') {
    return <MasterySemavicPage />
  }

  if (page.kind === 'mastery-venezuela') {
    return <MasteryVenezuelaPage />
  }

  if (page.kind === 'mastery-third-line') {
    return <MasteryThirdLinePage />
  }

  if (page.kind === 'mastery-putin') {
    return <MasteryPutinPage />
  }

  if (page.kind === 'env-navigator') {
    return <EnvNavigatorPage />
  }

  if (page.kind === 'practice-equipment') {
    return <PracticeEquipmentPage />
  }

  if (page.kind === 'practice-weeks') {
    return <PracticeWeeksPage />
  }

  if (page.kind === 'practice-error-first') {
    return <PracticeErrorFirstPage />
  }

  if (page.kind === 'practice-market') {
    return <PracticeMarketPage />
  }

  if (page.kind === 'practice-modernization') {
    return <PracticeModernizationPage />
  }

  if (page.kind === 'practice-ai') {
    return <PracticeAiPage />
  }

  if (page.kind === 'practice-long-term') {
    return <PracticeLongTermPage />
  }

  if (page.kind === 'practice-methodology') {
    return <PracticeMethodologyPage />
  }

  if (page.kind === 'practice-bureaucracy') {
    return <PracticeBureaucracyPage />
  }

  if (page.kind === 'practice-habits') {
    return <PracticeHabitsPage />
  }

  if (page.kind === 'closing-cover') {
    return <ClosingCoverPage />
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
          onJumpYear={onHistoryJumpYear}
          jumpYear={historyJumpYear}
          onJumpYearHandled={onHistoryJumpYearHandled}
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
          {page.title && <h2 className="page-title">{fixPrepositions(page.title)}</h2>}
          <div className="page-body">
            {page.body?.map((p) => (
              <p key={p.slice(0, 24)}>{fixPrepositions(p)}</p>
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
          {page.quote && <blockquote>{fixPrepositions(page.quote)}</blockquote>}
          <div className="page-body">
            {page.body?.map((p) => (
              <p key={p.slice(0, 24)}>{fixPrepositions(p)}</p>
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
          {page.title && <h2 className="page-title">{fixPrepositions(page.title)}</h2>}
          <div className="page-body">
            {page.body?.map((p) => (
              <p key={p.slice(0, 24)}>{fixPrepositions(p)}</p>
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
          {page.title && <h2 className="page-title">{fixPrepositions(page.title)}</h2>}
          <div className="values-grid">
            {page.values?.map((v) => (
              <div className="value-card" key={v.name} style={{ ['--accent' as string]: v.color }}>
                <h3>{fixPrepositions(v.name)}</h3>
                <p>{fixPrepositions(v.desc)}</p>
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
        {page.title && <h2 className="page-title">{fixPrepositions(page.title)}</h2>}
        <div className="page-body">
          {page.body?.map((p) => (
            <p key={p.slice(0, 24)}>{fixPrepositions(p)}</p>
          ))}
        </div>
      </div>
    </article>
  )
}
