import { BOOK_META } from '../data/book'
import { asset } from '../asset'
import '../styles/cover.css'

interface CoverProps {
  onOpen: () => void
  /** Decorative clone in the split panel */
  inert?: boolean
}

export function Cover({ onOpen, inert = false }: CoverProps) {
  return (
    <section
      className="cover"
      aria-label={inert ? undefined : 'Обложка книги'}
      aria-hidden={inert || undefined}
    >
      <div className="cover__hero">
        <div className="cover__content">
          <img
            className="cover__logo"
            src={asset('img/main/logo.svg')}
            alt="ГЕРОФАРМ ТРАНСФОРМАЦИЯ"
          />

          <h1 className="cover__title">
            История.
            <br />
            Культура.
            <br />
            Будущее
          </h1>

          <button
            type="button"
            className="primary-btn"
            onClick={onOpen}
            tabIndex={inert ? -1 : undefined}
          >
            Открыть книгу
            <span aria-hidden>→</span>
          </button>

          <p className="cover__hashtag" aria-label={BOOK_META.hashtag.replace(/_/g, ' ')}>
            #компанию
            <br />
            меняют
            <br />
            люди
          </p>
        </div>

        <div className="cover__visual" aria-hidden={inert || undefined}>
          <div className="cover__cell cover__cell--1">
            <img src={asset('img/main/02.jpg')} alt="" />
          </div>
          <div className="cover__cell cover__cell--2 optional">
            <img src={asset('img/main/03.jpg')} alt="" />
          </div>
          <div className="cover__cell cover__cell--3 cover__cell--person">
            <img src={asset('img/main/01.jpg')} alt="" />
          </div>
          <div className="cover__cell cover__cell--4 optional">
            <img src={asset('img/main/04.jpg')} alt="" />
          </div>
          <div className="cover__cell cover__cell--5">
            <img src={asset('img/main/06.png')} alt="" />
          </div>
        </div>
      </div>
    </section>
  )
}
