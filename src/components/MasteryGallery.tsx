import { useEffect, useRef } from 'react'
import { masteryGallery } from '../data/masteryGallery'
import { useMediaQuery } from '../hooks'
import '../styles/mastery-gallery.css'

export function MasteryGalleryPage({
  onOpenStory,
}: {
  onOpenStory?: (pageId: string) => void
}) {
  const rootRef = useRef<HTMLElement | null>(null)
  const coarse = useMediaQuery('(pointer: coarse)')
  const phone = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const onMove = (e: MouseEvent) => {
      if (window.innerWidth <= 900) return
      for (const card of root.querySelectorAll<HTMLElement>('.mg__card')) {
        const rect = card.getBoundingClientRect()
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
      }
    }

    root.addEventListener('mousemove', onMove)
    return () => root.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <article
      ref={rootRef}
      className="page-shell page-bleed page-mastery-gallery"
      aria-label={masteryGallery.title}
    >
      <div className="mg__inner">
        <span className="mg__badge">{masteryGallery.badge}</span>
        <h1 className="mg__title">{masteryGallery.title}</h1>

        <div className="mg__grid" role="list">
          {masteryGallery.cards.map((card) => (
            <button
              key={card.id}
              type="button"
              className="mg__card card"
              role="listitem"
              style={{ ['--mg-tone' as string]: card.tone }}
              onClick={(e) => {
                e.currentTarget.blur()
                onOpenStory?.(card.pageId)
              }}
            >
              <span className="mg__card-face" aria-hidden />
              <span className="mg__card-title">{card.title}</span>
            </button>
          ))}
        </div>

        <p className="mg__instruction">
          {phone || coarse ? 'Выбери историю' : masteryGallery.instruction}
        </p>

        <div className="mg__brand">
          <span>ГЕРОФАРМ</span>
          <span className="mg__mark" aria-hidden />
          <span>ТРАНСФОРМАЦИЯ</span>
        </div>
      </div>
    </article>
  )
}
