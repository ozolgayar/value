import { totalPages } from '../data/book'

export type BookView = 'cover' | 'welcome' | 'reader'

const KEY = 'gph-value-book-location'
const VIEWS: BookView[] = ['cover', 'welcome', 'reader']

function isBookView(value: unknown): value is BookView {
  return VIEWS.some((view) => view === value)
}

export function readBookLocation(): { view: BookView; pageIndex: number } {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { view: 'cover', pageIndex: 0 }
    const data = JSON.parse(raw) as { view?: unknown; pageIndex?: unknown }
    const view = isBookView(data.view) ? data.view : 'cover'
    const rawIndex = typeof data.pageIndex === 'number' ? data.pageIndex : 0
    const pageIndex = Math.min(Math.max(Math.floor(rawIndex), 0), Math.max(totalPages - 1, 0))
    return { view, pageIndex }
  } catch {
    return { view: 'cover', pageIndex: 0 }
  }
}

export function writeBookLocation(view: BookView, pageIndex: number) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ view, pageIndex }))
  } catch {
    /* private mode / blocked storage */
  }
}
