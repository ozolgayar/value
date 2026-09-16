import { BOOK_META } from '../data/book'
import { asset } from '../asset'
import '../styles/closing-cover.css'

export function ClosingCoverPage() {
  return (
    <article className="page-shell page-bleed page-closing-cover" aria-label="Культурный путеводитель ГЕРОФАРМ">
      <div className="closing-cover__media" aria-hidden />
      <div className="closing-cover__scrim" aria-hidden />
      <div className="closing-cover__gradient" aria-hidden />
      <div className="closing-cover__gradient-glow" aria-hidden />

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
          <h1 className="closing-cover__title">
            Культурный
            <br />
            путеводитель
            <br />
            ГЕРОФАРМ
          </h1>
          <p className="closing-cover__hash">{BOOK_META.hashtag}</p>
        </div>
        <img
          className="closing-cover__qr"
          src={asset('img/14.png')}
          alt="QR-код путеводителя ГЕРОФАРМ"
        />
      </div>
    </article>
  )
}
