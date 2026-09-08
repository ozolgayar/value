import { useCallback, useEffect, useState } from 'react'

const KEY = 'gph-value-book-bookmarks'

export interface Bookmark {
  pageId: string
  label: string
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
