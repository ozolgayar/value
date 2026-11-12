import { asset } from '../asset'
import {
  bingoResultPreviewSamples,
  bingoResultProfiles,
  cultureBingo,
  type BingoResultProfile,
} from '../data/cultureBingo'
import { fixPrepositions } from '../lib/fixPrepositions'
import '../styles/culture-bingo.css'

const PREVIEW_BY_ID = Object.fromEntries(
  bingoResultProfiles.map((profile) => [profile.id, profile]),
) as Record<string, BingoResultProfile>

export function BingoResultsPreview() {
  const total = cultureBingo.tiles.length

  return (
    <div className="app-shell theme-reader" style={{ height: '100vh', overflow: 'auto' }}>
      <article
        className="page-shell page-bleed page-culture-bingo page-culture-bingo--result page-culture-bingo--preview"
        aria-label="Превью всех результатов бинго"
      >
        <div className="cb__result-shell cb__result-shell--preview">
          <div className="cb__preview-banner">
            <div>
              <p className="cb__preview-title">Превью всех карточек результата бинго</p>
              <p className="cb__preview-hint">
                Локальная страница · откройте через ?bingoResults=1
              </p>
            </div>
          </div>

          {bingoResultPreviewSamples.map((sample) => {
            const profile = PREVIEW_BY_ID[sample.profileId]
            if (!profile) return null
            return (
              <div
                key={profile.id}
                className="cb__preview-item"
                data-accent={profile.accent}
              >
                <p className="cb__preview-label">
                  Профиль: {profile.name} · пример {sample.count}/{total}
                </p>
                <div className="cb__result-card">
                  <header className="cb__result-head">
                    <h1 className="cb__result-score">
                      Ваш результат {sample.count}/{total}
                    </h1>
                    <p className="cb__result-summary">
                      {fixPrepositions(sample.summary)}
                    </p>
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
                      <h2 className="cb__result-name">
                        {fixPrepositions(profile.name)}
                      </h2>
                      <p className="cb__result-text">
                        {fixPrepositions(profile.body)}
                      </p>
                      <p className="cb__result-note">{profile.disclaimer}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </article>
    </div>
  )
}
