import { useEffect, useRef, useState, type RefObject } from 'react'

export type PinPhase = 'before' | 'pinned' | 'after'

function viewportHeight() {
  return window.visualViewport?.height ?? window.innerHeight
}

/**
 * Scroll-driven pin (replaces CSS sticky — broken in Safari when body has
 * overflow-x hidden, and unreliable when the toolbar resizes vh units).
 *
 * scrollVhMultiplier = scrollable distance in viewport heights (380vh → 3.8).
 */
export function useScrollPin(
  sectionRef: RefObject<HTMLElement | null>,
  scrollVhMultiplier = 3.8,
) {
  const progress = useRef(0)
  const [phase, setPhase] = useState<PinPhase>('before')
  const [progressUi, setProgressUi] = useState(0)
  const [layout, setLayout] = useState({ vh: 800, sectionH: 800 * 4.8 })

  useEffect(() => {
    const measure = () => {
      const vh = viewportHeight()
      setLayout({ vh, sectionH: vh * (scrollVhMultiplier + 1) })
    }
    measure()
    window.visualViewport?.addEventListener('resize', measure)
    window.addEventListener('resize', measure)
    return () => {
      window.visualViewport?.removeEventListener('resize', measure)
      window.removeEventListener('resize', measure)
    }
  }, [scrollVhMultiplier])

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const el = sectionRef.current
      if (el) {
        const vh = viewportHeight()
        const scrollLen = vh * scrollVhMultiplier
        const top = el.getBoundingClientRect().top
        const p = scrollLen > 0 ? Math.min(1, Math.max(0, -top / scrollLen)) : 0

        progress.current = p

        const rounded = Math.round(p * 200) / 200
        setProgressUi((prev) => (prev !== rounded ? rounded : prev))

        const next: PinPhase = top > 0 ? 'before' : p >= 1 ? 'after' : 'pinned'
        setPhase((prev) => (prev !== next ? next : prev))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [sectionRef, scrollVhMultiplier])

  return { progress, phase, progressUi, layout }
}
