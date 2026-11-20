import { BOOK_META } from '../data/book'
import { asset } from '../asset'
import '../styles/closing-cover.css'

export function ClosingCoverPage({
  onRestartBook,
}: {
  onRestartBook?: () => void
}) {
  return (
    <article
      className="page-shell page-bleed page-closing-cover"
      aria-label="Продолжение следует"
    >
      <div className="closing-cover__media" aria-hidden />
      <div className="closing-cover__scrim" aria-hidden />

      <div className="closing-cover__top">
        <span className="pill closing-cover__badge">
          <span>ГЕРОФАРМ</span>
          <img
            className="closing-cover__trans-mark"
            src={asset('logo/trans-mark-only.png')}
            alt=""
            aria-hidden
          />
          <span>ТРАНСФОРМАЦИЯ</span>
        </span>
      </div>

      <div className="closing-cover__bottom">
        <div className="closing-cover__copy">
          <h1 className="closing-cover__title">Продолжение следует</h1>
          <p className="closing-cover__hash">{BOOK_META.hashtag}</p>
          {onRestartBook ? (
            <button
              type="button"
              className="closing-cover__cta primary-btn"
              onClick={onRestartBook}
            >
              В начало книги
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
