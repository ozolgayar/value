import { useCallback, useState } from 'react'
import { AkonyGate, requestAkonyClose } from './components/AkonyGate'
import { Cover } from './components/Cover'
import { House3DLab } from './components/House3DLab'
import { MissionStrategyHousePage } from './components/StrategyHouse'
import { Preloader } from './components/Preloader'
import { Cursor } from './components/Cursor'
import { Reader } from './components/Reader'
import { Welcome } from './components/Welcome'
import './styles/global.css'
import './styles/typography.css'

type View = 'cover' | 'welcome' | 'reader'

const VIEW_TRANSITION_MS = 650

function isHouse3dLab() {
  return new URLSearchParams(window.location.search).has('house3d')
}

function isStrategyHousePreview() {
  return new URLSearchParams(window.location.search).has('strategyHouse')
}

function BookApp() {
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

      {booting && <Preloader onDone={() => setBooting(false)} />}

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
