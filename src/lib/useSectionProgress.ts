import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * Progress 0..1 of a tall section being scrolled through:
 * 0 when its top hits viewport top, 1 when its bottom hits viewport bottom.
 * Returned as a ref (for rAF consumers) plus optional state updates.
 */
export function useSectionProgress(
  ref: RefObject<HTMLElement | null>,
  onChange?: (p: number) => void,
) {
  const progress = useRef(0)
  const cb = useRef(onChange)
  cb.current = onChange

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const el = ref.current
      if (el) {
        const rect = el.getBoundingClientRect()
        const total = rect.height - window.innerHeight
        const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0
        if (p !== progress.current) {
          progress.current = p
          cb.current?.(p)
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ref])

  return progress
}

/** Same as useSectionProgress but re-renders (throttled to frame quantum). */
export function useSectionProgressState(ref: RefObject<HTMLElement | null>, steps = 1000) {
  const [p, setP] = useState(0)
  useSectionProgress(ref, (v) => setP(Math.round(v * steps) / steps))
  return p
}
