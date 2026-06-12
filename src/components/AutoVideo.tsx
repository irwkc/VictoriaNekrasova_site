import { useLayoutEffect, useRef, type Ref } from 'react'
import {
  isMediaUnlocked,
  primeVideo,
  registerVideo,
  unregisterVideo,
  tryPlay,
} from '../lib/unlockMedia'

type Props = {
  src: string
  className?: string
  ref?: Ref<HTMLVideoElement>
  onTimeUpdate?: React.ReactEventHandler<HTMLVideoElement>
}

export default function AutoVideo({ ref, src, className, onTimeUpdate }: Props) {
  const inner = useRef<HTMLVideoElement | null>(null)

  useLayoutEffect(() => {
    const el = inner.current
    if (!el) return
    const cleanupWatch = registerVideo(el)

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[entries.length - 1]?.isIntersecting && isMediaUnlocked()) tryPlay(el)
      },
      { threshold: 0.1, rootMargin: '100px' },
    )
    io.observe(el)

    return () => {
      io.disconnect()
      cleanupWatch()
      unregisterVideo(el)
    }
  }, [src])

  return (
    <video
      ref={(el) => {
        inner.current = el
        if (el) {
          primeVideo(el)
          if (isMediaUnlocked()) tryPlay(el)
        }
        if (typeof ref === 'function') ref(el)
        else if (ref) ref.current = el
      }}
      src={src}
      className={`ambient-video ${className ?? ''}`}
      onTimeUpdate={onTimeUpdate}
      muted
      playsInline
      autoPlay
      loop
      preload="auto"
      tabIndex={-1}
      aria-hidden
    />
  )
}
