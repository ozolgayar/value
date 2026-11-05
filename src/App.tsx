import { useCallback, useEffect, useState } from 'react'
import { AkonyGate, requestAkonyClose } from './components/AkonyGate'
import { Cover } from './components/Cover'
import { House3DLab } from './components/House3DLab'
import { MissionStrategyHousePage } from './components/StrategyHouse'
import { Preloader } from './components/Preloader'
import { Cursor } from './components/Cursor'
import { Reader } from './components/Reader'
import { Welcome } from './components/Welcome'
import { readBookLocation, writeBookLocation, type BookView } from './lib/bookLocation'
import './styles/global.css'
import './styles/typography.css'

type View = BookView

const VIEW_TRANSITION_MS = 650
const PRELOADER_DONE_KEY = 'gph-value-book-preloader-done'

/** Open `/?reset=1` to clear saved progress / coach / bookmarks for this origin. */
function consumeResetFlag() {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('reset')) return
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith('gph-value-book') || key.startsWith('geropharm'))
      .forEach((key) => localStorage.removeItem(key))
  } catch {
    /* private mode / blocked storage */
  }
  url.searchParams.delete('reset')
  const next = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState({}, '', next || '/')
}

consumeResetFlag()

function readPreloaderDone() {
  try {
    return localStorage.getItem(PRELOADER_DONE_KEY) === '1'
  } catch {
    return false
  }
}

function writePreloaderDone() {
  try {
    localStorage.setItem(PRELOADER_DONE_KEY, '1')
  } catch {
    /* private mode / blocked storage */
  }
}

function isHouse3dLab() {
  return new URLSearchParams(window.location.search).has('house3d')
}

function isStrategyHousePreview() {
  return new URLSearchParams(window.location.search).has('strategyHouse')
}

function forcePreloaderPreview() {
  return new URLSearchParams(window.location.search).has('preloader')
}

function BookApp() {
  const preloaderPreview = forcePreloaderPreview()
  const [booting, setBooting] = useState(
    () => preloaderPreview || !readPreloaderDone(),
  )
  const [view, setView] = useState<View>(() => readBookLocation().view)
  const [prevView, setPrevView] = useState<View | null>(null)
  const [readerIndex, setReaderIndex] = useState(() => readBookLocation().pageIndex)

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

  const handlePageIndex = useCallback((pageIndex: number) => {
    setReaderIndex(pageIndex)
  }, [])

  useEffect(() => {
    writeBookLocation(view, readerIndex)
  }, [view, readerIndex])

  const gateOpen = view === 'welcome'
  const akonyActive = view === 'cover' || gateOpen
  const showAkony =
    akonyActive || prevView === 'cover' || prevView === 'welcome'
  const showReader = view === 'reader' || prevView === 'reader'

  /** Keep welcome page visible while fading out into the reader */
  const gatePageOpen = gateOpen || (view === 'reader' && prevView === 'welcome')

  const bookOpenTransition = view === 'reader' && prevView === 'welcome'
  const shellTheme =
    view === 'reader' ||
    bookOpenTransition ||
    (view === 'cover' && prevView === 'reader')
      ? 'theme-reader'
      : gateOpen || gatePageOpen
        ? 'theme-contents'
        : 'theme-cover'

  return (
    <div
      className={`app-shell ${shellTheme}${bookOpenTransition ? ' is-book-open' : ''}`}
    >
      <div className="app-shell__wash" aria-hidden />
      <Cursor />

      {booting && (
        <Preloader
          loop={preloaderPreview}
          onDone={() => {
            if (preloaderPreview) return
            writePreloaderDone()
            setBooting(false)
          }}
        />
      )}

      {showAkony && (
        <div
          className={`view akony-view${
            akonyActive ? ' is-active' : bookOpenTransition ? ' screen-exit' : ' is-exit'
          }`}
        >
          <AkonyGate
            open={gatePageOpen}
            onOpen={() => setView('welcome')}
            onClose={() => setView('cover')}
            cover={({ openBook }) => <Cover onOpen={openBook} />}
            coverInert={({ openBook }) => <Cover onOpen={openBook} inert />}
            contents={
              <Welcome
                onBack={() => requestAkonyClose()}
                onContinue={() => go('reader', 0)}
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
            onPageIndexChange={handlePageIndex}
            onExitToHome={() => go('cover')}
            onBackToWelcome={() => go('welcome')}
          />
        </div>
      )}
    </div>
  )
}

export default function App() {
  if (isStrategyHousePreview()) {
    return (
      <div className="app-shell theme-reader" style={{ height: '100vh' }}>
        <MissionStrategyHousePage />
      </div>
    )
  }

  if (isHouse3dLab()) {
    return (
      <div className="app-shell theme-reader">
        <House3DLab />
      </div>
    )
  }

  return <BookApp />
}
