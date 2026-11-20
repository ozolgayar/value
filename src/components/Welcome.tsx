import { asset } from '../asset'
import { fixPrepositions } from '../lib/fixPrepositions'
import '../styles/welcome.css'

interface WelcomeProps {
  onContinue: () => void
  onBack: () => void
}

export function Welcome({ onContinue, onBack }: WelcomeProps) {
  return (
    <section className="welcome" aria-label="Добро пожаловать">
      <div className="welcome__grid" aria-hidden />

      <div className="welcome__inner">
        <img
          className="welcome__logo"
          src={asset('img/main/logo.svg')}
          alt="ГЕРОФАРМ ТРАНСФОРМАЦИЯ"
        />

        <h1 className="welcome__title">Добро пожаловать</h1>

        <div className="welcome__card">
          <p className="welcome__lead">
            {fixPrepositions(
              'Каждый день ты вносишь вклад в здоровье пациентов. Эта книга поможет увидеть, как твоя работа связана с общим результатом, почувствовать команду и двигаться вперёд увереннее — с пониманием и вдохновением',
            )}
          </p>

          <div className="welcome__instruction">
            <strong>Как читать:</strong>
            <span>
              {fixPrepositions(
                'по порядку или сразу перейти к нужному разделу в меню',
              )}
            </span>
          </div>
        </div>

        <div className="welcome__actions">
          <button type="button" className="secondary-btn" onClick={onBack}>
            На главную
          </button>
          <button type="button" className="primary-btn" onClick={onContinue}>
            Начать читать
          </button>
        </div>
      </div>
    </section>
  )
}
