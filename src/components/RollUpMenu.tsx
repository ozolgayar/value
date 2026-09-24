import { useEffect } from 'react'
import { asset } from '../asset'
import '../styles/rollup.css'

interface RollUpMenuProps {
  open: boolean
  onToggle: () => void
  onClose: () => void
  onContents: () => void
  onBookStart: () => void
  onCover: () => void
  onQuotes: () => void
}

export function RollUpMenu({
  open,
  onToggle,
  onClose,
  onContents,
  onBookStart,
  onCover,
  onQuotes,
}: RollUpMenuProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div className={`roll-menu${open ? ' is-open' : ''}`}>
      <div className="roll-menu__overlay" onClick={onClose} aria-hidden={!open} />

      <button
        type="button"
        className="roll-menu__trigger"
        aria-label="Открыть меню"
        aria-expanded={open}
        aria-hidden={open}
        onClick={onToggle}
        tabIndex={open ? -1 : 0}
      >
        <span className="roll-menu__trigger-label">Меню</span>
        <span className="roll-menu__burger" aria-hidden>
          <span />
          <span />
          <span />
        </span>
      </button>

      <div
        className="roll-menu__panel"
        role="dialog"
        aria-modal={open}
        aria-label="Меню"
        aria-hidden={!open}
      >
        <button
          type="button"
          className="roll-menu__close"
          aria-label="Закрыть меню"
          onClick={onClose}
          tabIndex={open ? 0 : -1}
        >
          <span aria-hidden>×</span>
        </button>

        <nav className="roll-menu__nav">
          <button
            type="button"
            className="roll-menu__link"
            tabIndex={open ? 0 : -1}
            title="Открыть содержание разделов"
            data-tooltip="Открыть содержание разделов"
            onClick={() => {
              onClose()
              onContents()
            }}
          >
            Содержание
          </button>
          <button
            type="button"
            className="roll-menu__link"
            tabIndex={open ? 0 : -1}
            title="К первой странице книги"
            data-tooltip="К первой странице книги"
            onClick={() => {
              onClose()
              onBookStart()
            }}
          >
            Начало книги
          </button>
          <button
            type="button"
            className="roll-menu__link"
            tabIndex={open ? 0 : -1}
            title="Открыть сохранённые заметки"
            data-tooltip="Открыть сохранённые заметки"
            onClick={() => {
              onClose()
              onQuotes()
            }}
          >
            Мои заметки
          </button>
        </nav>

        <div className="roll-menu__footer">
          <p className="roll-menu__tagline">История. Культура. Будущее</p>
          <button
            type="button"
            className="roll-menu__home"
            tabIndex={open ? 0 : -1}
            aria-label="На обложку"
            title="На обложку"
            data-tooltip="На обложку"
            onClick={() => {
              onClose()
              onCover()
            }}
          >
            <img
              className="roll-menu__home-icon"
              src={asset('icons/house.svg')}
              alt=""
              aria-hidden
            />
          </button>
        </div>
      </div>
    </div>
  )
}
