import { useEffect } from 'react'

const pool = new Set<HTMLVideoElement>()
let unlocked = false

export function primeVideo(el: HTMLVideoElement) {
  el.muted = true
  el.defaultMuted = true
  el.volume = 0
  el.playsInline = true
  el.setAttribute('muted', '')
  el.setAttribute('playsinline', '')
  el.setAttribute('webkit-playsinline', '')
}

export function registerVideo(el: HTMLVideoElement) {
  pool.add(el)
  primeVideo(el)
  el.play().catch(() => {})
  if (unlocked) el.play().catch(() => {})
}

export function unregisterVideo(el: HTMLVideoElement) {
  pool.delete(el)
}

export function unlockAllMedia() {
  if (unlocked) return
  unlocked = true
  pool.forEach((v) => {
    primeVideo(v)
    v.play().catch(() => {})
  })
}

/** First scroll / tap unlocks muted autoplay in Safari (required after pause or off-screen). */
export function useMediaUnlock() {
  useEffect(() => {
    const unlock = () => unlockAllMedia()

    const opts: AddEventListenerOptions = { capture: true, passive: true }
    const events: (keyof WindowEventMap)[] = [
      'touchstart',
      'touchend',
      'click',
      'wheel',
      'scroll',
      'keydown',
    ]

    events.forEach((e) => window.addEventListener(e, unlock, opts))
    return () => events.forEach((e) => window.removeEventListener(e, unlock, opts))
  }, [])
}
