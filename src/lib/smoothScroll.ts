import type Lenis from 'lenis'

const NAV_OFFSET = -80

let lenis: Lenis | null = null

export function setSmoothScroller(instance: Lenis | null) {
  lenis = instance
}

export function scrollToHash(hash: string, opts?: { delay?: number }) {
  const id = hash.replace(/^#/, '')
  if (!id) return

  const run = () => {
    const el = document.getElementById(id)
    if (!el) return

    if (lenis) {
      lenis.scrollTo(el, {
        offset: NAV_OFFSET,
        duration: 1.65,
        easing: (t) => 1 - Math.pow(1 - t, 4),
      })
      return
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const delay = opts?.delay ?? 0
  if (delay > 0) {
    window.setTimeout(run, delay)
  } else {
    run()
  }
}
