const pool = new Set<HTMLVideoElement>()
const watchers = new Map<HTMLVideoElement, ReturnType<typeof setInterval>>()
let mediaUnlocked = false

export function isMediaUnlocked() {
  return mediaUnlocked
}

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

/** Must run synchronously inside a user-gesture handler in Safari. */
export function tryPlay(el: HTMLVideoElement) {
  primeVideo(el)
  el.play().catch(() => {})
}

function watchPlaying(el: HTMLVideoElement) {
  if (watchers.has(el)) return () => {}

  const tick = () => {
    if (mediaUnlocked && el.paused && !document.hidden) tryPlay(el)
  }

  const id = window.setInterval(tick, 500)
  watchers.set(el, id)

  const onPause = () => {
    if (mediaUnlocked && !document.hidden) requestAnimationFrame(() => tryPlay(el))
  }
  el.addEventListener('pause', onPause)

  const resume = () => {
    if (mediaUnlocked) tryPlay(el)
  }
  el.addEventListener('canplay', resume)

  return () => {
    clearInterval(id)
    watchers.delete(el)
    el.removeEventListener('pause', onPause)
    el.removeEventListener('canplay', resume)
  }
}

export function registerVideo(el: HTMLVideoElement) {
  pool.add(el)
  primeVideo(el)
  if (mediaUnlocked) tryPlay(el)
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

/** Call directly from click / pointerdown — not from setTimeout. */
export function unlockAllMedia() {
  mediaUnlocked = true
  pool.forEach((v) => tryPlay(v))
}

/** Warm Safari's media pipeline before the user taps enter. */
export function preloadVideos(urls: string[]) {
  urls.forEach((src) => {
    const v = document.createElement('video')
    primeVideo(v)
    v.preload = 'auto'
    v.src = src
    v.load()
  })
}

export function initMediaUnlock() {
  const unlock = () => unlockAllMedia()
  const opts: AddEventListenerOptions = { capture: true, passive: true }
  ;(['pointerdown', 'touchstart', 'click', 'keydown'] as const).forEach((e) =>
    window.addEventListener(e, unlock, opts),
  )
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && mediaUnlocked) unlockAllMedia()
  })
  return () => {
    ;(['pointerdown', 'touchstart', 'click', 'keydown'] as const).forEach((e) =>
      window.removeEventListener(e, unlock, opts),
    )
  }
}
