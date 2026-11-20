import { useLayoutEffect, useRef } from 'react'
import { asset } from '../asset'
import type { BookPage } from '../data/book'
import { fixPrepositions } from '../lib/fixPrepositions'

export function SplitJourneyPage({ page }: { page: BookPage }) {
  const rootRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const title = titleRef.current
    if (!root || !title) return

    const sync = () => {
      if (window.matchMedia('(max-width: 860px)').matches) {
        root.style.removeProperty('--split-right-top')
        return
      }
      const rootTop = root.getBoundingClientRect().top
      const titleTop = title.getBoundingClientRect().top
      root.style.setProperty(
        '--split-right-top',
        `${Math.max(0, Math.round(titleTop - rootTop))}px`,
      )
    }

    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(root)
    ro.observe(title)
    window.addEventListener('resize', sync)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', sync)
      root.style.removeProperty('--split-right-top')
    }
  }, [page])

  const inviteFrom =
    page.body?.findIndex((line) => line.startsWith('Станьте')) ?? -1

  return (
    <article ref={rootRef} className="page-shell page-bleed page-split">
      <div className="page-split__left">
        <div className="page-split__left-inner">
          {page.title && (
            <h2 ref={titleRef} className="page-split__title">
              {fixPrepositions(page.title)
                .split('\n')
                .map((line, i, arr) => (
                  <span key={`${i}-${line.slice(0, 16)}`}>
                    {line}
                    {i < arr.length - 1 ? <br /> : null}
                  </span>
                ))}
            </h2>
          )}
          <div className="page-split__body">
            {page.body?.map((p, i) => {
              if (inviteFrom >= 0 && i >= inviteFrom) return null
              return <p key={p.slice(0, 24)}>{fixPrepositions(p)}</p>
            })}
            {inviteFrom >= 0 ? (
              <div className="page-split__invite-block">
                <div className="page-split__invite-rule" aria-hidden />
                {page.body?.slice(inviteFrom).map((p) => {
                  const text = fixPrepositions(p)
                  // fixPrepositions may insert NBSP after short words («Как»).
                  const howMatch = text.match(/^(Как\s+отправить:)/)
                  if (howMatch) {
                    const howPrefix = howMatch[1]
                    return (
                      <p key={p.slice(0, 24)} className="page-split__invite-note">
                        <span className="page-split__invite-accent">{howPrefix}</span>
                        {text.slice(howPrefix.length)}
                      </p>
                    )
                  }
                  return (
                    <p key={p.slice(0, 24)} className="page-split__invite">
                      {text}
                    </p>
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>
        {page.meta?.logo && (
          <img
            className="page-split__logo"
            src={asset(page.meta.logo)}
            alt="ГЕРОФАРМ Трансформация"
          />
        )}
      </div>
      <div className="page-split__right">
        <div className="page-split__right-inner">
          {page.sideTitle && (
            <h3 className="page-split__side-title">
              {fixPrepositions(page.sideTitle)}
            </h3>
          )}
          {page.sideItems && (
            <ul className="page-split__list">
              {page.sideItems.map((item) => {
                const sepMatch = item.match(/\s+[–—-]\s+/)
                if (!sepMatch || sepMatch.index == null) {
                  return <li key={item}>{fixPrepositions(item)}</li>
                }
                const label = item.slice(0, sepMatch.index)
                const rest = item.slice(sepMatch.index + sepMatch[0].length)
                return (
                  <li key={item}>
                    <strong className="page-split__list-label">
                      {fixPrepositions(label)}
                    </strong>
                    {sepMatch[0]}
                    {fixPrepositions(rest)}
                  </li>
                )
              })}
            </ul>
          )}
          {page.footerSlogan && (
            <>
              <div className="page-split__divider" aria-hidden />
              <p className="page-split__slogan">
                {page.footerSlogan.split('\n').map((line) => (
                  <span key={line} className="page-split__slogan-line">
                    {fixPrepositions(line)}
                  </span>
                ))}
              </p>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
