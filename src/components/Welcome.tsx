import { BOOK_META } from '../data/book'
import '../styles/welcome.css'

interface WelcomeProps {
  onContinue: () => void
  onBack: () => void
}

export function Welcome({ onContinue, onBack }: WelcomeProps) {
  return (
    <section className="welcome" aria-label="Добро пожаловать">
      <div className="welcome__blob welcome__blob--1" aria-hidden />
      <div className="welcome__blob welcome__blob--2" aria-hidden />
      <div className="welcome__pattern welcome__pattern--right" aria-hidden />
      <div className="welcome__pattern welcome__pattern--left" aria-hidden />

      <div className="welcome__inner">
        <div className="welcome__panel">
          <header className="welcome__header">
            <p className="welcome__eyebrow">История. Культура. Будущее.</p>
            <h1 className="welcome__title">Добро пожаловать</h1>
            <p className="welcome__subtitle">
              Эта книга о том, что нас объединяет, зачем мы работаем и как принимаем
              решения
            </p>
          </header>

          <div className="welcome__help">
            <p className="welcome__help-lead">
              ГЕРОФАРМ отмечает 25 лет и эта книга о нас: о культуре людей, которые
              своими действиями меняют жизнь людей к лучшему. Это стратегический
              ориентир для каждого сотрудника: он помогает соотнести повседневные
              задачи со Стратегией 2030.
            </p>
          </div>

          <p className="welcome__note">
            Читать можно по порядку или открыть нужный раздел в меню
          </p>

          <p className="welcome__hash">{BOOK_META.hashtag}</p>

          <footer className="welcome__footer">
            <button type="button" className="welcome__back" onClick={onBack}>
              ← На главную
            </button>
            <button type="button" className="btn-primary welcome__cta" onClick={onContinue}>
              Начать читать
              <span aria-hidden>→</span>
            </button>
          </footer>
        </div>
      </div>
    </section>
  )
}
