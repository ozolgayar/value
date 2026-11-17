import { useEffect, useMemo, useState } from 'react'
import { asset } from '../asset'
import type { PracticeCaseData } from '../data/practiceCase'
import { SectionEndNav } from './SectionEndNav'
import '../styles/practice-equipment.css'

type Phase = 'choose' | 'feedback'

function optionLetter(key: string) {
  const match = key.match(/[АБВ]/)
  return match?.[0] ?? key.replace(/[).:\s]/g, '')
}

function parseBestLetters(bestOption: string) {
  // Only the choice letter after «Вариант», not the «В» inside the word itself.
  const match = bestOption.match(/Вариант\s*([АБВ])/i)
  if (match?.[1]) return new Set([match[1].toUpperCase()])
  const fallback = bestOption.match(/([АБВ])\s*$/)
  return new Set(fallback?.[1] ? [fallback[1]] : [])
}

function fallbackConsequence(letter: string) {
  return `Вариант ${letter} слабее опирается на ценности компании: путь получается дольше, а риски для качества и пациентов выше.`
}

export function PracticeCasePage({
  data,
}: {
  data: PracticeCaseData
  onFinishSection?: () => void
}) {
  const { left, right } = data
  const [phase, setPhase] = useState<Phase>('choose')
  const [chosenKey, setChosenKey] = useState<string | null>(null)
  const [showOthers, setShowOthers] = useState(false)

  useEffect(() => {
    setPhase('choose')
    setChosenKey(null)
    setShowOthers(false)
  }, [data])

  useEffect(() => {
    if (!showOthers) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowOthers(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showOthers])

  const bestLetters = useMemo(
    () => parseBestLetters(right.bestOption),
    [right.bestOption],
  )
  const chosenOption = left.options.find((o) => o.key === chosenKey)
  const otherOptions = left.options.filter(
    (opt) => !bestLetters.has(optionLetter(opt.key)),
  )

  return (
    <article
      className={`page-shell page-bleed page-practice-equipment is-${phase}${
        phase === 'feedback' ? ' is-best' : ''
      }`}
    >
      <div className="pe__frame">
        <div className="pe__split">
          <aside className="pe__summary pe__panel-slide-left" aria-label="Ситуация">
            <span className="pe__badge">{left.badge}</span>
            <h1 className="pe__title pe__title--compact">{left.title}</h1>
            <h2 className="pe__section pe__section--ink">{left.situationLabel}</h2>
            <p className="pe__situation pe__situation--full">{left.situation}</p>
            {phase === 'choose' ? (
              <div className="pe__task">
                <p className="pe__task-text">
                  Выбери решение, которое лучше всего соответствует ценностям
                  компании
                </p>
              </div>
            ) : null}

            {phase === 'feedback' && chosenOption && (
              <div className="pe__picked">
                <span className="pe__picked-label">Твой выбор</span>
                <p className="pe__picked-text">
                  <span className="pe__picked-key">{chosenOption.key}</span>{' '}
                  {chosenOption.text}
                </p>
              </div>
            )}
          </aside>

          <section
            className={`pe__right pe__panel-slide-right${
              phase === 'feedback' ? ' pe__right--feedback' : ''
            }`}
            aria-live="polite"
          >
            {phase === 'choose' && (
              <div className="pe__choose">
                <h2 className="pe__choose-title">Какой вариант выберешь?</h2>
                <div className="pe__cards">
                  {left.options.map((opt, i) => (
                    <button
                      key={opt.key}
                      type="button"
                      className="pe__choice-card"
                      style={{ animationDelay: `${i * 60}ms` }}
                      onClick={() => {
                        setChosenKey(opt.key)
                        setShowOthers(false)
                        setPhase('feedback')
                      }}
                    >
                      <span className="pe__choice-letter" aria-hidden>
                        {optionLetter(opt.key)}
                      </span>
                      <span className="pe__choice-body">
                        <span className="pe__choice-key">{opt.key}</span>
                        <span className="pe__choice-text">{opt.text}</span>
                      </span>
                      <span className="pe__choice-hint" aria-hidden>
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {phase === 'feedback' && (
              <div className="pe__feedback pe__feedback-enter">
                <div className="pe__feedback-body">
                  <h2 className="pe__verdict pe__verdict--best-title">
                    {right.bestLabel} {right.bestOption}
                  </h2>
                  <ul className="pe__values">
                    {right.values.map((item) => (
                      <li key={item.text} className="pe__value">
                        <span className="pe__icon-wrap">
                          <img
                            className={`pe__icon${
                              item.icon.includes('11.png') ? ' is-brain' : ''
                            }`}
                            src={asset(item.icon)}
                            alt=""
                            aria-hidden
                          />
                        </span>
                        <p>{item.text}</p>
                      </li>
                    ))}
                  </ul>
                  <p className="pe__result">
                    <strong>{right.resultLabel}</strong> {right.result}
                  </p>
                  {otherOptions.length > 0 ? (
                    <div className="pe__others">
                      <button
                        type="button"
                        className="pe__cta pe__cta--ghost"
                        onClick={() => setShowOthers(true)}
                      >
                        Посмотреть другие решения
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {showOthers ? (
        <div
          className="pe__modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pe-others-title"
        >
          <button
            type="button"
            className="pe__modal-backdrop"
            aria-label="Закрыть"
            onClick={() => setShowOthers(false)}
          />
          <div className="pe__modal-card">
            <div className="pe__modal-head">
              <h2 id="pe-others-title" className="pe__modal-title">
                Другие решения и последствия
              </h2>
              <button
                type="button"
                className="pe__modal-close"
                aria-label="Закрыть"
                onClick={() => setShowOthers(false)}
              >
                ×
              </button>
            </div>
            <ul className="pe__others-list pe__others-list--modal">
              {otherOptions.map((opt) => {
                const letter = optionLetter(opt.key)
                return (
                  <li key={opt.key} className="pe__other">
                    <p className="pe__other-title">Вариант {letter}</p>
                    <p className="pe__other-decision">{opt.text}</p>
                    <p className="pe__other-text">
                      <strong>Последствие:</strong>{' '}
                      {opt.consequence ?? fallbackConsequence(letter)}
                    </p>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      ) : null}

      {phase === 'feedback' ? <SectionEndNav /> : null}
    </article>
  )
}
