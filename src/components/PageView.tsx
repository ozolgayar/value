import type { BookPage } from '../data/book'
import { asset } from '../asset'

export function PageView({ page }: { page: BookPage }) {
  if (page.kind === 'ceo') {
    return (
      <article className="page-shell page-bleed page-ceo">
        <div className="page-ceo__aside">
          <img
            className="page-ceo__photo"
            src={asset(page.meta?.photo ?? 'covers/ceo.jpg')}
            alt={page.meta?.name ?? 'Портрет'}
          />
          <p className="page-ceo__name">{page.meta?.name}</p>
          <p className="page-ceo__role">{page.meta?.role}</p>
        </div>
        <div className="page-ceo__main">
          {page.badge && <span className="pill page-badge">{page.badge}</span>}
          {page.title && <h2 className="page-title">{page.title}</h2>}
          <div className="page-ceo__text">
            {page.body?.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </article>
    )
  }

  if (page.kind === 'split') {
    return (
      <article className="page-shell page-bleed page-split">
        <div className="page-split__left">
          {page.meta?.chapter && (
            <span className="page-split__chapter" aria-hidden>
              {page.meta.chapter}
            </span>
          )}
          <div className="page-split__left-inner">
            {page.title && <h2 className="page-split__title">{page.title}</h2>}
            <div className="page-split__body">
              {page.body?.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
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
            {page.sideTitle && <h3 className="page-split__side-title">{page.sideTitle}</h3>}
            {page.sideItems && (
              <ul className="page-split__list">
                {page.sideItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {page.footerSlogan && (
              <>
                <div className="page-split__divider" aria-hidden />
                <p className="page-split__slogan">
                  <span className="page-split__quote-mark" aria-hidden>
                    «
                  </span>
                  {page.footerSlogan.replace(/\n/g, ' ')}
                  <span className="page-split__quote-mark" aria-hidden>
                    »
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      </article>
    )
  }

  if (page.kind === 'section-open') {
    return (
      <article className="page-shell page-bleed page-open">
        <div className="page-open__inner">
          {page.badge && <span className="pill page-badge">{page.badge}</span>}
          {page.title && <h2 className="page-title">{page.title}</h2>}
          <div className="page-body">
            {page.body?.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </article>
    )
  }

  if (page.kind === 'quote') {
    return (
      <article className="page-shell page-bleed page-quote">
        <div className="page-pad">
          {page.badge && <span className="pill page-badge">{page.badge}</span>}
          {page.quote && <blockquote>{page.quote}</blockquote>}
          <div className="page-body">
            {page.body?.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </article>
    )
  }

  if (page.kind === 'timeline') {
    return (
      <article className="page-shell page-bleed page-timeline">
        <div className="page-pad">
          {page.badge && <span className="pill page-badge">{page.badge}</span>}
          {page.title && <h2 className="page-title">{page.title}</h2>}
          <div className="page-body">
            {page.body?.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          {page.years && (
            <div className="timeline">
              {page.years.map((y) => (
                <div className="timeline__item" key={y.year}>
                  <span className="timeline__year">{y.year}</span>
                  <p className="timeline__text">{y.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </article>
    )
  }

  if (page.kind === 'values') {
    return (
      <article className="page-shell page-bleed">
        <div className="page-pad">
          {page.badge && <span className="pill page-badge">{page.badge}</span>}
          {page.title && <h2 className="page-title">{page.title}</h2>}
          <div className="values-grid">
            {page.values?.map((v) => (
              <div className="value-card" key={v.name} style={{ ['--accent' as string]: v.color }}>
                <h3>{v.name}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="page-shell page-bleed">
      <div className="page-pad">
        {page.badge && <span className="pill page-badge">{page.badge}</span>}
        {page.title && <h2 className="page-title">{page.title}</h2>}
        <div className="page-body">
          {page.body?.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </div>
    </article>
  )
}
