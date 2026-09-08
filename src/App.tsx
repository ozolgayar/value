import { useCallback, useState } from 'react'
import { flatPages } from './data/book'
import { Contents } from './components/Contents'
import { Cover } from './components/Cover'
import { Reader } from './components/Reader'
import './styles/global.css'

type View = 'cover' | 'contents' | 'reader'

function firstIndexOfSection(sectionId: string) {
  return Math.max(
    0,
    flatPages.findIndex((p) => p.sectionId === sectionId),
  )
}

export default function App() {
  const [view, setView] = useState<View>('cover')
  const [prevView, setPrevView] = useState<View | null>(null)
  const [readerIndex, setReaderIndex] = useState(0)

  const go = useCallback((next: View, index = 0) => {
    if (next === view) return
    setPrevView(view)
    if (next === 'reader') setReaderIndex(index)
    setView(next)
    window.setTimeout(() => setPrevView(null), 700)
  }, [view])

  const show = (v: View) => view === v || prevView === v

  return (
    <div className="app-shell">
      {show('cover') && (
        <div className={`view${view === 'cover' ? ' is-active' : ' is-exit'}`}>
          <Cover onOpen={() => go('contents')} />
        </div>
      )}

      {show('contents') && (
        <div className={`view${view === 'contents' ? ' is-active' : ' is-exit'}`}>
          <Contents
            onBack={() => go('cover')}
            onStart={() => go('reader', 0)}
            onSelectSection={(id) => go('reader', firstIndexOfSection(id))}
          />
        </div>
      )}

      {show('reader') && (
        <div className={`view${view === 'reader' ? ' is-active' : ' is-exit'}`}>
          <Reader initialIndex={readerIndex} onExitToContents={() => go('contents')} />
        </div>
      )}
    </div>
  )
}
