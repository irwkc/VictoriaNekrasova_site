import { useEffect, useState, type RefObject } from 'react'

export function useInView(
  ref: RefObject<Element | null>,
  rootMargin = '0px',
  enabled = true,
) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setInView(false)
      return
    }
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { rootMargin, threshold: 0.01 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, rootMargin, enabled])

  return inView
}

export function useIdleMount(enabled: boolean, timeoutMs = 800) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setReady(false)
      return
    }

    let cancelled = false
    const run = () => {
      if (!cancelled) setReady(true)
    }

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(run, { timeout: timeoutMs })
      return () => {
        cancelled = true
        window.cancelIdleCallback(id)
      }
    }

    const id = globalThis.setTimeout(run, 120)
    return () => {
      cancelled = true
      globalThis.clearTimeout(id)
    }
  }, [enabled, timeoutMs])

  return ready
}
