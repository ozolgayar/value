import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../styles/akony.css'

gsap.registerPlugin(ScrollTrigger)

const SCROLL_DISTANCE = 1600
const OPEN_DURATION = 1.85
const FADE_DURATION = 0.7
const SCRUB_SMOOTH = 1.25
/** Cover swings open to the left (degrees) */
const OPEN_ANGLE = -155

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
  const scrollerRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const coverRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const stRef = useRef<ScrollTrigger | null>(null)
  const openRef = useRef(open)
  const onOpenRef = useRef(onOpen)
  const onCloseRef = useRef(onClose)
  const busyRef = useRef(false)
  const skipOpenSyncRef = useRef(false)
  const [curtainLive, setCurtainLive] = useState(!open)
  const [seamVisible, setSeamVisible] = useState(false)
  const [fadingHome, setFadingHome] = useState(false)
  const [opening, setOpening] = useState(false)

  openRef.current = open
  onOpenRef.current = onOpen
  onCloseRef.current = onClose

  const finishOpen = () => {
    const scroller = scrollerRef.current
    const page = pageRef.current
    if (scroller) scroller.scrollTop = SCROLL_DISTANCE
    stRef.current?.scroll(SCROLL_DISTANCE)
    if (page) gsap.set(page, { opacity: 1, clearProps: 'transform' })
    setCurtainLive(false)
    setSeamVisible(false)
    setFadingHome(false)
    setOpening(false)
    busyRef.current = false
    if (!openRef.current) onOpenRef.current()
  }

  const finishClose = () => {
    const scroller = scrollerRef.current
    const page = pageRef.current
    const leaf = coverRef.current

    // Sync scroll silently after the fade — animating it mid-fade causes a jump
    if (scroller) scroller.scrollTop = 0
    stRef.current?.scroll(0)
    if (leaf) gsap.set(leaf, { rotateY: 0, force3D: true })
    if (page) gsap.set(page, { opacity: 1 })

    skipOpenSyncRef.current = true
    setCurtainLive(true)
    setSeamVisible(false)
    setFadingHome(false)
    busyRef.current = false
    if (openRef.current) onCloseRef.current()
  }

  const openBook = () => {
    const scroller = scrollerRef.current
    const leaf = coverRef.current
    const page = pageRef.current
    if (!scroller || !leaf || busyRef.current) return

    busyRef.current = true
    setOpening(true)
    setCurtainLive(true)
    setSeamVisible(true)
    setFadingHome(false)
    if (page) gsap.set(page, { opacity: 1 })

    gsap.killTweensOf([scroller, leaf, page].filter(Boolean))

    gsap
      .timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: finishOpen,
      })
      .to(
        leaf,
        {
          rotateY: OPEN_ANGLE,
          duration: OPEN_DURATION,
          force3D: true,
        },
        0,
      )
      .to(
        scroller,
        {
          scrollTop: SCROLL_DISTANCE,
          duration: OPEN_DURATION,
        },
        0,
      )
  }

  /** Contents → cover: opacity crossfade only (no scroll tween) */
  const closeBook = () => {
    const leaf = coverRef.current
    const page = pageRef.current
    if (!leaf || !page || busyRef.current) return

    busyRef.current = true
    gsap.killTweensOf([leaf, page])

    // Cover flat under the page; keep layout locked (is-open stays via fadingHome)
    setFadingHome(true)
    setSeamVisible(false)
    gsap.set(leaf, { rotateY: 0, force3D: true })
    gsap.set(page, { opacity: 1 })

    // Unpark cover under the still-opaque page (no CSS opacity transition)
    setCurtainLive(true)

    gsap.to(page, {
      opacity: 0,
      duration: FADE_DURATION,
      ease: 'power2.inOut',
      overwrite: true,
      onComplete: finishClose,
    })
  }

  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    const leaf = coverRef.current
    const page = pageRef.current
    if (!scroller || !leaf) return

    if (skipOpenSyncRef.current) {
      skipOpenSyncRef.current = false
      // Already synced by finishClose — avoid ScrollTrigger.refresh jump
      return
    }

    gsap.killTweensOf([scroller, leaf, page].filter(Boolean))
    busyRef.current = false

    if (open) {
      scroller.scrollTop = SCROLL_DISTANCE
      gsap.set(leaf, { rotateY: OPEN_ANGLE, force3D: true })
      if (page) gsap.set(page, { opacity: 1 })
      setCurtainLive(false)
      setSeamVisible(false)
      setFadingHome(false)
      setOpening(false)
    } else {
      scroller.scrollTop = 0
      gsap.set(leaf, { rotateY: 0, force3D: true })
      if (page) gsap.set(page, { opacity: 1 })
      setCurtainLive(true)
      setSeamVisible(false)
      setFadingHome(false)
      setOpening(false)
    }
    ScrollTrigger.refresh()
  }, [open])

  useEffect(() => {
    const scroller = scrollerRef.current
    const pin = pinRef.current
    const leaf = coverRef.current
    if (!scroller || !pin || !leaf) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { force3D: true },
        scrollTrigger: {
          scroller,
          trigger: pin,
          start: 'top top',
          end: `+=${SCROLL_DISTANCE}`,
          scrub: reduced ? false : SCRUB_SMOOTH,
          pin: true,
          anticipatePin: 1,
          onRefresh(self) {
            stRef.current = self
          },
          onUpdate: (self) => {
            stRef.current = self
            if (busyRef.current) return
            if (gsap.isTweening(leaf) || gsap.isTweening(scroller)) return

            setSeamVisible(self.progress > 0.008 && self.progress < 0.992)
            gsap.set(leaf, { rotateY: OPEN_ANGLE * self.progress, force3D: true })

            if (self.progress >= 0.985) {
              setCurtainLive(false)
              setSeamVisible(false)
              if (!openRef.current) onOpenRef.current()
            } else if (self.progress <= 0.01) {
              setCurtainLive(true)
              setSeamVisible(false)
              if (openRef.current) onCloseRef.current()
            } else {
              setCurtainLive(true)
            }
          },
        },
      })

      tl.fromTo(leaf, { opacity: 1 }, { opacity: 1, ease: 'none', duration: 1 }, 0)

      if (openRef.current) {
        scroller.scrollTop = SCROLL_DISTANCE
        ScrollTrigger.update()
      }
    }, scroller)

    return () => {
      stRef.current = null
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    const handler = () => closeBook()
    window.addEventListener('akony:close', handler)
    return () => window.removeEventListener('akony:close', handler)
  }, [])

  const showContents = (open && !curtainLive) || fadingHome || opening

  return (
    <div
      ref={scrollerRef}
      className={`akony${showContents && !opening && !fadingHome ? ' is-open' : ''}${seamVisible ? ' is-flipping' : ''}${fadingHome ? ' is-fading-home' : ''}${opening ? ' is-opening' : ''}`}
      data-curtain={curtainLive ? 'live' : 'parked'}
    >
      <div ref={pinRef} className="akony__pin">
        <div className="akony__stage">
          <div className={`akony__curtain${curtainLive || fadingHome ? '' : ' is-parked'}`}>
            <div ref={coverRef} className="uc-akony-cover">
              <div className="akony__face akony__face--front">{cover({ openBook })}</div>
              <div className="akony__face akony__face--verso" aria-hidden />
            </div>
          </div>

          <div ref={pageRef} className="akony__page">
            <div className="akony__page-front">{contents}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function requestAkonyClose() {
  window.dispatchEvent(new Event('akony:close'))
}
