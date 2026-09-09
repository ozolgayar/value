import { useCallback, useState } from 'react'
import { flatPages } from './data/book'
import { AkonyGate, requestAkonyClose } from './components/AkonyGate'
import { Contents } from './components/Contents'
import { Cover } from './components/Cover'
import { Preloader } from './components/Preloader'
import { Reader } from './components/Reader'
import './styles/global.css'

type View = 'cover' | 'contents' | 'reader'

const VIEW_TRANSITION_MS = 650

function firstIndexOfSection(sectionId: string) {
  return Math.max(
    0,
    flatPages.findIndex((p) => p.sectionId === sectionId),
  )
}

export default function App() {
  const [booting, setBooting] = useState(true)
  const [view, setView] = useState<View>('cover')
  const [prevView, setPrevView] = useState<View | null>(null)
  const [readerIndex, setReaderIndex] = useState(0)

  const go = useCallback(
    (next: View, index = 0) => {
      if (next === view) return
      setPrevView(view)
      if (next === 'reader') setReaderIndex(index)
      setView(next)
      window.setTimeout(() => setPrevView(null), VIEW_TRANSITION_MS)
    },
    [view],
  )

  const akonyActive = view === 'cover' || view === 'contents'
  const showAkony =
    akonyActive || prevView === 'cover' || prevView === 'contents'
  const showReader = view === 'reader' || prevView === 'reader'

  /** Keep contents "open" while fading out into the reader */
  const contentsOpen =
    view === 'contents' || (view === 'reader' && prevView === 'contents')

  const bookOpenTransition = view === 'reader' && prevView === 'contents'
  const shellTheme =
    view === 'reader' || bookOpenTransition || (view === 'cover' && prevView === 'reader')
      ? 'theme-reader'
      : view === 'contents' || contentsOpen
        ? 'theme-contents'
        : 'theme-cover'

  return (
    <div
      className={`app-shell ${shellTheme}${bookOpenTransition ? ' is-book-open' : ''}`}
    >
      <div className="app-shell__wash" aria-hidden />

      {booting && <Preloader onDone={() => setBooting(false)} />}

      {showAkony && (
        <div
          className={`view akony-view${
            akonyActive ? ' is-active' : bookOpenTransition ? ' screen-exit' : ' is-exit'
          }`}
        >
          <AkonyGate
            open={contentsOpen}
            onOpen={() => setView('contents')}
            onClose={() => setView('cover')}
            cover={({ openBook }) => <Cover onOpen={openBook} />}
            coverInert={({ openBook }) => <Cover onOpen={openBook} inert />}
            contents={
              <Contents
                revealed={contentsOpen}
                onBack={() => requestAkonyClose()}
                onStart={() => go('reader', 0)}
                onSelectSection={(id) => go('reader', firstIndexOfSection(id))}
              />
            }
          />
        </div>
      )}

      {showReader && (
        <div
          className={`view reader-view${
            view === 'reader'
              ? bookOpenTransition
                ? ' is-active screen-enter'
                : ' is-active'
              : ' is-exit'
          }`}
        >
          <Reader
            initialIndex={readerIndex}
            onExitToHome={() => go('cover')}
          />
        </div>
      )}
    </div>
  )
}
