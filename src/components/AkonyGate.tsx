import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import '../styles/akony.css'

const OPEN_DURATION = 1.15
const CLOSE_DURATION = 0.85

type CoverFactory = (api: { openBook: () => void }) => ReactNode

interface AkonyGateProps {
  open: boolean
  onOpen: () => void
  onClose: () => void
  cover: CoverFactory
  coverInert: CoverFactory
  contents: ReactNode
}

export function AkonyGate({ open, onOpen, onClose, cover, coverInert: _coverInert, contents }: AkonyGateProps) {
  const coverRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const openRef = useRef(open)
  const onOpenRef = useRef(onOpen)
  const onCloseRef = useRef(onClose)
  const busyRef = useRef(false)
  const skipOpenSyncRef = useRef(false)
  const [curtainLive, setCurtainLive] = useState(!open)
  const [fadingHome, setFadingHome] = useState(false)
  const [opening, setOpening] = useState(false)

  openRef.current = open
  onOpenRef.current = onOpen
  onCloseRef.current = onClose

  const finishOpen = () => {
    const leaf = coverRef.current
    if (leaf) gsap.set(leaf, { xPercent: -100 })
    setCurtainLive(false)
    setFadingHome(false)
    setOpening(false)
    busyRef.current = false
    if (!openRef.current) onOpenRef.current()
  }

  const finishClose = () => {
    const leaf = coverRef.current
    const page = pageRef.current
    if (leaf) gsap.set(leaf, { xPercent: 0 })
    if (page) gsap.set(page, { opacity: 1 })

    skipOpenSyncRef.current = true
    setCurtainLive(true)
    setFadingHome(false)
    setOpening(false)
    busyRef.current = false
    if (openRef.current) onCloseRef.current()
  }

  const openBook = () => {
    const leaf = coverRef.current
    const page = pageRef.current
    if (!leaf || busyRef.current) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    busyRef.current = true
    setOpening(true)
    setCurtainLive(true)
    setFadingHome(false)
    if (page) gsap.set(page, { opacity: 1 })

    gsap.killTweensOf([leaf, page].filter(Boolean))

    if (reduced) {
      gsap.set(leaf, { xPercent: -100 })
      finishOpen()
      return
    }

    gsap.fromTo(
      leaf,
      { xPercent: 0 },
      {
        xPercent: -100,
        duration: OPEN_DURATION,
        ease: 'power3.inOut',
        force3D: true,
        onComplete: finishOpen,
      },
    )
  }

  const closeBook = () => {
    const leaf = coverRef.current
    const page = pageRef.current
    if (!leaf || busyRef.current) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    busyRef.current = true
    gsap.killTweensOf([leaf, page].filter(Boolean))

    setFadingHome(true)
    setOpening(false)
    setCurtainLive(true)
    if (page) gsap.set(page, { opacity: 1 })

    if (reduced) {
      gsap.set(leaf, { xPercent: 0 })
      finishClose()
      return
    }

    gsap.fromTo(
      leaf,
      { xPercent: -100 },
      {
        xPercent: 0,
        duration: CLOSE_DURATION,
        ease: 'power3.inOut',
        force3D: true,
        onComplete: finishClose,
      },
    )
  }

  useLayoutEffect(() => {
    const leaf = coverRef.current
    const page = pageRef.current
    if (!leaf) return

    if (skipOpenSyncRef.current) {
      skipOpenSyncRef.current = false
      return
    }

    gsap.killTweensOf([leaf, page].filter(Boolean))
    busyRef.current = false

    if (open) {
      gsap.set(leaf, { xPercent: -100 })
      if (page) gsap.set(page, { opacity: 1 })
      setCurtainLive(false)
      setFadingHome(false)
      setOpening(false)
    } else {
      gsap.set(leaf, { xPercent: 0 })
      if (page) gsap.set(page, { opacity: 1 })
      setCurtainLive(true)
      setFadingHome(false)
      setOpening(false)
    }
  }, [open])

  useEffect(() => {
    const handler = () => closeBook()
    window.addEventListener('akony:close', handler)
    return () => window.removeEventListener('akony:close', handler)
  }, [])

  const showContents = (open && !curtainLive) || fadingHome || opening

  return (
    <div
      className={`akony${showContents && !opening && !fadingHome ? ' is-open' : ''}${fadingHome ? ' is-fading-home' : ''}${opening ? ' is-opening' : ''}`}
      data-curtain={curtainLive ? 'live' : 'parked'}
    >
      <div className="akony__stage">
        <div className={`akony__curtain${curtainLive || fadingHome ? '' : ' is-parked'}`}>
          <div ref={coverRef} className="uc-akony-cover">
            <div className="akony__face akony__face--front">{cover({ openBook })}</div>
          </div>
        </div>

        <div ref={pageRef} className="akony__page">
          <div className="akony__page-front">{contents}</div>
        </div>
      </div>
    </div>
  )
}

export function requestAkonyClose() {
  window.dispatchEvent(new Event('akony:close'))
}
