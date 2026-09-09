import { useEffect } from 'react'
import '../styles/rollup.css'

interface RollUpMenuProps {
  open: boolean
  onToggle: () => void
  onClose: () => void
  onContents: () => void
  onHome: () => void
  onQuotes: () => void
}

export function RollUpMenu({
  open,
  onToggle,
  onClose,
  onContents,
  onHome,
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
            onClick={() => {
              onClose()
              onHome()
            }}
          >
            На главную
          </button>
          <button
            type="button"
            className="roll-menu__link"
            tabIndex={open ? 0 : -1}
            onClick={() => {
              onClose()
              onQuotes()
            }}
          >
            Цитаты
          </button>
        </nav>

        <div className="roll-menu__footer">
          <p className="roll-menu__tagline">Культурный путеводитель ГЕРОФАРМ</p>
          <button
            type="button"
            className="roll-menu__cta"
            tabIndex={open ? 0 : -1}
            onClick={() => {
              onClose()
              onHome()
            }}
          >
            На главную
          </button>
        </div>
      </div>
    </div>
  )
}
