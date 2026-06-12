import type { ReactNode } from 'react'

type Props = {
  src: string
  alt: string
  caption?: ReactNode
  index?: number
  className?: string
  /** Admin thumbnails — no tilt or drop shadow. */
  flat?: boolean
}

export default function PolaroidFrame({ src, alt, caption, index = 0, className = '', flat = false }: Props) {
  const tilt = flat ? 0 : ((index % 5) - 2) * 0.35

  return (
    <div
      className={`group/polaroid relative flex h-full w-auto max-w-full flex-col bg-[#f2efe8] p-2 pt-2 pb-7 transition-[transform,box-shadow] duration-500 ease-out md:p-2.5 md:pb-9 ${
        flat
          ? 'shadow-none'
          : 'shadow-[0_10px_40px_rgba(0,0,0,0.38)] hover:shadow-[0_16px_52px_rgba(0,0,0,0.48)]'
      } ${className}`}
      style={{
        aspectRatio: '88 / 107',
        rotate: `${tilt}deg`,
      }}
    >
      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          draggable={false}
          className="max-h-full max-w-full object-contain grayscale transition-[filter,transform] duration-500 ease-out group-hover/polaroid:scale-[1.02] group-hover/polaroid:grayscale-0"
        />
      </div>

      {caption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between px-2.5 pb-2 font-mono text-[8px] tracking-[0.22em] text-ink/55 opacity-0 transition-opacity duration-300 group-hover/polaroid:opacity-100 md:px-3 md:pb-2.5 md:text-[9px]">
          {caption}
        </div>
      )}
    </div>
  )
}
