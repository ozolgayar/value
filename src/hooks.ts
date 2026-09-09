import { useCallback, useEffect, useState } from 'react'

const KEY = 'gph-value-book-bookmarks'
const QUOTES_KEY = 'gph-value-book-quotes'

export interface Bookmark {
  pageId: string
  label: string
  savedAt: number
}

export interface Quote {
  id: string
  text: string
  pageId: string
  pageLabel: string
  savedAt: number
}

function read(): Bookmark[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Bookmark[]) : []
  } catch {
    return []
  }
}

function readQuotes(): Quote[] {
  try {
    const raw = localStorage.getItem(QUOTES_KEY)
    return raw ? (JSON.parse(raw) as Quote[]) : []
  } catch {
    return []
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  useEffect(() => {
    setBookmarks(read())
  }, [])

  const persist = useCallback((next: Bookmark[]) => {
    setBookmarks(next)
    localStorage.setItem(KEY, JSON.stringify(next))
  }, [])

  const isBookmarked = useCallback(
    (pageId: string) => bookmarks.some((b) => b.pageId === pageId),
    [bookmarks],
  )

  const toggle = useCallback(
    (pageId: string, label: string) => {
      const exists = bookmarks.some((b) => b.pageId === pageId)
      const next = exists
        ? bookmarks.filter((b) => b.pageId !== pageId)
        : [...bookmarks, { pageId, label, savedAt: Date.now() }]
      persist(next)
    },
    [bookmarks, persist],
  )

  const remove = useCallback(
    (pageId: string) => persist(bookmarks.filter((b) => b.pageId !== pageId)),
    [bookmarks, persist],
  )

  return { bookmarks, isBookmarked, toggle, remove }
}

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([])

  useEffect(() => {
    setQuotes(readQuotes())
  }, [])

  const persist = useCallback((next: Quote[]) => {
    setQuotes(next)
    localStorage.setItem(QUOTES_KEY, JSON.stringify(next))
  }, [])

  const add = useCallback(
    (text: string, pageId: string, pageLabel: string) => {
      const cleaned = text.replace(/\s+/g, ' ').trim()
      if (!cleaned) return false
      if (quotes.some((q) => q.text === cleaned && q.pageId === pageId)) return false
      const next: Quote[] = [
        {
          id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          text: cleaned,
          pageId,
          pageLabel,
          savedAt: Date.now(),
        },
        ...quotes,
      ]
      persist(next)
      return true
    },
    [quotes, persist],
  )

  const remove = useCallback(
    (id: string) => persist(quotes.filter((q) => q.id !== id)),
    [quotes, persist],
  )

  return { quotes, add, remove }
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
