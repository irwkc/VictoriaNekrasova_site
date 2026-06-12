import { useEffect, useRef, type VideoHTMLAttributes, type Ref } from 'react'

type Props = VideoHTMLAttributes<HTMLVideoElement> & { ref?: Ref<HTMLVideoElement> }

/**
 * Muted looping video that actually autoplays in Safari (React doesn't render
 * the `muted` attribute, so we set it imperatively before calling play) and
 * pauses itself when scrolled out of the viewport.
 */
export default function AutoVideo({ ref, ...props }: Props) {
  const inner = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const el = inner.current
    if (!el) return
    el.muted = true
    el.defaultMuted = true

    let visible = false
    const tryPlay = () => {
      if (visible && el.paused) el.play().catch(() => {})
    }
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[entries.length - 1].isIntersecting
        if (visible) tryPlay()
        else el.pause()
      },
      { rootMargin: '50px' },
    )
    io.observe(el)
    // Safari may reject the first play() before data is ready — retry once loaded
    el.addEventListener('canplay', tryPlay)
    return () => {
      io.disconnect()
      el.removeEventListener('canplay', tryPlay)
    }
  }, [])

  return (
    <video
      ref={(el) => {
        inner.current = el
        if (typeof ref === 'function') ref(el)
        else if (ref) ref.current = el
      }}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      {...props}
    />
  )
}
