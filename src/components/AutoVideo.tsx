import { useEffect, useRef, type Ref, type VideoHTMLAttributes } from 'react'
import { primeVideo, registerVideo, unregisterVideo } from '../lib/unlockMedia'

type Props = Omit<VideoHTMLAttributes<HTMLVideoElement>, 'ref'> & {
  ref?: Ref<HTMLVideoElement>
}

export default function AutoVideo({ ref, src, className, onTimeUpdate, ...rest }: Props) {
  const inner = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const el = inner.current
    if (!el) return

    registerVideo(el)

    const retry = () => el.play().catch(() => {})
    el.addEventListener('loadeddata', retry)
    el.addEventListener('canplay', retry)

    return () => {
      el.removeEventListener('loadeddata', retry)
      el.removeEventListener('canplay', retry)
      unregisterVideo(el)
    }
  }, [src])

  return (
    <video
      ref={(el) => {
        inner.current = el
        if (el) primeVideo(el)
        if (typeof ref === 'function') ref(el)
        else if (ref) ref.current = el
      }}
      src={src}
      className={className}
      onTimeUpdate={onTimeUpdate}
      muted
      defaultMuted
      playsInline
      autoPlay
      loop
      preload="auto"
      controls={false}
      disablePictureInPicture
      {...rest}
    />
  )
}
