import { useEffect, useMemo, useState } from 'react'
import { asset } from '../asset'
import { cultureBingo, scoreBingo } from '../data/cultureBingo'
import { fixPrepositions } from '../lib/fixPrepositions'
import { SectionEndNav } from './SectionEndNav'
import '../styles/culture-bingo.css'

type Phase = 'play' | 'result'

function scrollBingoPageTop() {
  const page = document.querySelector(
    '.reader__page:not([aria-hidden="true"])',
  ) as HTMLElement | null
  if (page) page.scrollTop = 0
  const shell = document.querySelector(
    '.reader__page:not([aria-hidden="true"]) .page-culture-bingo',
  ) as HTMLElement | null
  if (shell) shell.scrollTop = 0
}

export function CultureBingoPage() {
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [phase, setPhase] = useState<Phase>('play')

  const result = useMemo(() => scoreBingo(selected), [selected])

  useEffect(() => {
    if (phase !== 'result') return
    scrollBingoPageTop()
    const id = window.requestAnimationFrame(() => scrollBingoPageTop())
    return () => window.cancelAnimationFrame(id)
  }, [phase])

  function toggleTile(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function showResult() {
    setPhase('result')
  }

  function replay() {
    setSelected(new Set())
    setPhase('play')
  }

  if (phase === 'result') {
    const { count, total, profile, summary } = result
    return (
      <article
        className="page-shell page-bleed page-culture-bingo page-culture-bingo--result"
        data-accent={profile.accent}
        aria-label="Результат культурного бинго"
      >
        <div className="cb__result-shell">
          <div className="cb__result-card">
            <header className="cb__result-head">
              <h1 className="cb__result-score">
                Ваш результат {count}/{total}
              </h1>
              <p className="cb__result-summary">{fixPrepositions(summary)}</p>
            </header>

            <div className="cb__result-body">
              <div className="cb__result-visual" aria-hidden>
                <div className="cb__result-orb" />
                <img
                  className="cb__result-icon"
                  src={asset(profile.icon)}
                  alt=""
                  width={120}
                  height={120}
                  decoding="async"
                />
                <div className="cb__confetti" />
              </div>
              <div className="cb__result-copy">
                <span className="cb__result-tag">{profile.tag}</span>
                <h2 className="cb__result-name">{fixPrepositions(profile.name)}</h2>
                <p className="cb__result-text">{fixPrepositions(profile.body)}</p>
                <p className="cb__result-note">{profile.disclaimer}</p>
              </div>
            </div>

            <div className="cb__result-actions">
              <button type="button" className="cb__btn cb__btn--ghost" onClick={replay}>
                {cultureBingo.replay}
              </button>
            </div>
          </div>
        </div>
        <SectionEndNav />
      </article>
    )
  }

  return (
    <article
      className="page-shell page-bleed page-culture-bingo"
      aria-label={cultureBingo.title}
    >
      <div className="cb__inner">
        <header className="cb__header">
          <h1 className="cb__title">{fixPrepositions(cultureBingo.title)}</h1>
          <p className="cb__subtitle">{fixPrepositions(cultureBingo.subtitle)}</p>
        </header>

        <div className="cb__grid" role="group" aria-label="Поле бинго">
          {cultureBingo.tiles.map((tile) => {
            const checked = selected.has(tile.id)
            return (
              <button
                key={tile.id}
                type="button"
                className={`cb__tile${checked ? ' is-checked' : ''}`}
                aria-pressed={checked}
                onClick={() => toggleTile(tile.id)}
              >
                <span className="cb__tile-check" aria-hidden>
                  {checked ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                      <path
                        d="M5 12.5 10 17.5 19 7"
                        stroke="currentColor"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </span>
                <span className="cb__tile-text">{fixPrepositions(tile.text)}</span>
              </button>
            )
          })}
        </div>

        <div className="cb__footer">
          <div className="cb__brand" aria-hidden>
            <span>ГЕРОФАРМ</span>
            <span className="cb__mark" />
            <span>ТРАНСФОРМАЦИЯ</span>
          </div>
          <button type="button" className="cb__btn cb__btn--primary" onClick={showResult}>
            {cultureBingo.cta}
          </button>
        </div>
      </div>
    </article>
  )
}
