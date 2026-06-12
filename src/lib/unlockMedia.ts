const pool = new Set<HTMLVideoElement>()
const watchers = new Map<HTMLVideoElement, ReturnType<typeof setInterval>>()

export function primeVideo(el: HTMLVideoElement) {
  el.muted = true
  el.defaultMuted = true
  el.volume = 0
  el.autoplay = true
  el.loop = true
  el.playsInline = true
  el.controls = false
  el.disablePictureInPicture = true
  el.setAttribute('muted', '')
  el.setAttribute('autoplay', '')
  el.setAttribute('loop', '')
  el.setAttribute('playsinline', '')
  el.setAttribute('webkit-playsinline', '')
  el.setAttribute('x-webkit-airplay', 'deny')
  el.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback')
}

export function tryPlay(el: HTMLVideoElement) {
  primeVideo(el)
  el.play().catch(() => {})
}

function watchPlaying(el: HTMLVideoElement) {
  if (watchers.has(el)) return () => {}

  const id = window.setInterval(() => {
    if (el.paused && !document.hidden) tryPlay(el)
  }, 400)
  watchers.set(el, id)

  const onPause = () => {
    if (!document.hidden) requestAnimationFrame(() => tryPlay(el))
  }
  el.addEventListener('pause', onPause)

  const resume = () => tryPlay(el)
  el.addEventListener('loadeddata', resume)
  el.addEventListener('canplay', resume)
  el.addEventListener('canplaythrough', resume)

  return () => {
    clearInterval(id)
    watchers.delete(el)
    el.removeEventListener('pause', onPause)
    el.removeEventListener('loadeddata', resume)
    el.removeEventListener('canplay', resume)
    el.removeEventListener('canplaythrough', resume)
  }
}

export function registerVideo(el: HTMLVideoElement) {
  pool.add(el)
  tryPlay(el)
  return watchPlaying(el)
}

export function unregisterVideo(el: HTMLVideoElement) {
  pool.delete(el)
  const id = watchers.get(el)
  if (id) {
    clearInterval(id)
    watchers.delete(el)
  }
}

export function unlockAllMedia() {
  pool.forEach((v) => tryPlay(v))
}

export function initMediaUnlock() {
  const unlock = () => unlockAllMedia()
  const opts: AddEventListenerOptions = { capture: true, passive: true }
  const events: (keyof WindowEventMap)[] = [
    'pointerdown',
    'touchstart',
    'click',
    'keydown',
    'wheel',
    'scroll',
  ]
  events.forEach((e) => window.addEventListener(e, unlock, opts))
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) unlockAllMedia()
  })
  return () => events.forEach((e) => window.removeEventListener(e, unlock, opts))
}
