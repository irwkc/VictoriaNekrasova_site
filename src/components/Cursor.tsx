import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const pos = { x: -100, y: -100 }
    const smooth = { x: -100, y: -100 }
    let raf = 0
    let hovering = false

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX
      pos.y = e.clientY
      const t = e.target as HTMLElement
      hovering = !!t.closest('a, button, [data-hover]')
    }
    const tick = () => {
      smooth.x += (pos.x - smooth.x) * 0.16
      smooth.y += (pos.y - smooth.y) * 0.16
      if (dot.current)
        dot.current.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`
      if (ring.current)
        ring.current.style.transform = `translate(${smooth.x}px, ${smooth.y}px) translate(-50%, -50%) scale(${hovering ? 2.4 : 1})`
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="hidden md:block">
      <div
        ref={dot}
        className="fixed top-0 left-0 z-[110] w-1.5 h-1.5 rounded-full bg-blood pointer-events-none"
      />
      <div
        ref={ring}
        className="fixed top-0 left-0 z-[110] w-8 h-8 rounded-full border border-bone/40 pointer-events-none transition-[scale] mix-blend-difference"
      />
    </div>
  )
}
