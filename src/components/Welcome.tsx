import { fixPrepositions } from '../lib/fixPrepositions'
import '../styles/welcome.css'

interface WelcomeProps {
  onContinue: () => void
  onBack: () => void
}

export function Welcome({ onContinue, onBack }: WelcomeProps) {
  return (
    <section className="welcome" aria-label="Добро пожаловать">
      <div className="welcome__light-field" aria-hidden />
      <div className="welcome__ambient" aria-hidden>
        <span className="welcome__blob welcome__blob--cyan" />
        <span className="welcome__blob welcome__blob--violet" />
        <span className="welcome__blob welcome__blob--sky" />
        <span className="welcome__blob welcome__blob--peach" />
      </div>
      <div className="welcome__shade" aria-hidden />
      <div className="welcome__lenses" aria-hidden>
        <i className="welcome__lens welcome__lens--1" />
        <i className="welcome__lens welcome__lens--2" />
        <i className="welcome__lens welcome__lens--3" />
        <i className="welcome__lens welcome__lens--4" />
        <i className="welcome__lens welcome__lens--5" />
        <i className="welcome__lens welcome__lens--6" />
        <i className="welcome__lens welcome__lens--7" />
        <i className="welcome__lens welcome__lens--8" />
        <i className="welcome__lens welcome__lens--9" />
      </div>
      <div className="welcome__dark-cuts" aria-hidden />
      <div className="welcome__grid" aria-hidden />
      <div className="welcome__frame" aria-hidden />
      <div className="welcome__shine" aria-hidden />

      <p className="welcome__bg-hashtag" aria-hidden>
        #КОМПАНИЮ
        <br />
        МЕНЯЮТ
        <br />
        ЛЮДИ
      </p>

      <div className="welcome__content">
        <header className="welcome__top">
          <p className="welcome__kicker">История · культура · будущее</p>
          <p className="welcome__guide">Культурный путеводитель</p>
          <p className="welcome__subtitle">
            {fixPrepositions('О культуре в одном месте и простым языком')}
          </p>
        </header>

        <h1 className="welcome__title">
          <span className="welcome__title-row welcome__title-row--1">
            <span className="welcome__title-word welcome__title-word--1">Добро</span>
          </span>
          <span className="welcome__title-row welcome__title-row--2">
            <span className="welcome__title-word welcome__title-word--2">пожаловать</span>
          </span>
        </h1>

        <div className="welcome__glass">
          <p className="welcome__lead">
            {fixPrepositions(
              'Каждый день ты вносишь вклад в здоровье пациентов. Эта книга покажет, как твоя работа связана с общим результатом, поможет тебе чувствовать команду и действовать уверенно — с вдохновением.',
            )}
          </p>
          <p className="welcome__read">
            <span>Как читать:</span>{' '}
            {fixPrepositions(
              'по порядку или сразу перейти к нужному разделу в меню.',
            )}
          </p>
          <div className="welcome__actions">
            <button type="button" className="welcome__cta" onClick={onContinue}>
              Начать читать
              <span aria-hidden>→</span>
            </button>
            <button type="button" className="welcome__back" onClick={onBack}>
              На главную
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
