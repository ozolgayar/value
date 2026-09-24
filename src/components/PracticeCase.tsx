import { useEffect, useMemo, useState } from 'react'
import { asset } from '../asset'
import type { PracticeCaseData } from '../data/practiceCase'
import '../styles/practice-equipment.css'

type Phase = 'situation' | 'choose' | 'feedback'

function optionLetter(key: string) {
  const match = key.match(/[АБВ]/)
  return match?.[0] ?? key.replace(/[).:\s]/g, '')
}

function parseBestLetters(bestOption: string) {
  return new Set(bestOption.match(/[АБВ]/g) ?? [])
}

export function PracticeCasePage({
  data,
  onFinishSection,
}: {
  data: PracticeCaseData
  onFinishSection?: () => void
}) {
  const { left, right } = data
  const [phase, setPhase] = useState<Phase>('situation')
  const [chosenKey, setChosenKey] = useState<string | null>(null)
  const [showOptimal, setShowOptimal] = useState(false)

  useEffect(() => {
    setPhase('situation')
    setChosenKey(null)
    setShowOptimal(false)
  }, [data])

  const bestLetters = useMemo(
    () => parseBestLetters(right.bestOption),
    [right.bestOption],
  )
  const chosenLetter = chosenKey ? optionLetter(chosenKey) : null
  const isBest = chosenLetter ? bestLetters.has(chosenLetter) : false
  const revealBest = isBest || showOptimal
  const chosenOption = left.options.find((o) => o.key === chosenKey)

  return (
    <article
      className={`page-shell page-bleed page-practice-equipment is-${phase}${
        revealBest ? ' is-best' : ''
      }${!isBest && phase === 'feedback' ? ' is-suboptimal' : ''}`}
    >
      <div className="pe__frame">
        {phase === 'situation' && (
          <section className="pe__situation-panel pe__enter" aria-label={left.title}>
            <div className="pe__situation-inner">
              <span className="pe__badge">{left.badge}</span>
              <h1 className="pe__title pe__title--hero">{left.title}</h1>
              <h2 className="pe__section pe__section--ink">{left.situationLabel}</h2>
              <p className="pe__situation pe__situation--wide">{left.situation}</p>
              <button
                type="button"
                className="pe__cta"
                onClick={() => setPhase('choose')}
              >
                Выбрать решение →
              </button>
            </div>
          </section>
        )}

        {phase !== 'situation' && (
          <div className="pe__split">
            <aside className="pe__summary pe__panel-slide-left" aria-label="Ситуация">
              <span className="pe__badge">{left.badge}</span>
              <h1 className="pe__title pe__title--compact">{left.title}</h1>
              <h2 className="pe__section pe__section--ink">{left.situationLabel}</h2>
              <p className="pe__situation pe__situation--full">{left.situation}</p>

              {phase === 'feedback' && chosenOption && (
                <div className="pe__picked">
                  <span className="pe__picked-label">Твой выбор</span>
                  <p className="pe__picked-text">
                    <strong>{chosenOption.key}</strong> {chosenOption.text}
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
                          setShowOptimal(false)
                          setPhase('feedback')
                        }}
                      >
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
                    {revealBest ? (
                      <>
                        <p className="pe__verdict pe__verdict--best">
                          Лучший выбор ✓
                          <span className="pe__verdict-sub">
                            {right.bestLabel} {right.bestOption}
                          </span>
                        </p>
                        <ul className="pe__values">
                          {right.values.map((item) => (
                            <li key={item.text} className="pe__value">
                              <span className="pe__icon-wrap">
                                <img
                                  className="pe__icon"
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
                        <button
                          type="button"
                          className="pe__cta pe__cta--finish"
                          onClick={() => onFinishSection?.()}
                        >
                          Завершить раздел
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="pe__verdict pe__verdict--neutral">
                          Твой выбор: {chosenLetter}
                        </p>
                        <p className="pe__why">
                          По ценностям ГЕРОФАРМ сильнее работает{' '}
                          {right.bestOption.replace(/\.$/, '')}. Он лучше удерживает
                          качество, ответственность и результат для пациентов.
                        </p>
                        <p className="pe__why pe__why--muted">{right.result}</p>
                        <button
                          type="button"
                          className="pe__cta pe__cta--ghost"
                          onClick={() => setShowOptimal(true)}
                        >
                          Посмотреть оптимальный выбор
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </article>
  )
}
