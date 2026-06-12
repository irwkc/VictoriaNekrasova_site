import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { frameCache, preloadFrames, projectorFrame, PROJECTOR_COUNT } from '../lib/frames'
import { useSectionProgress } from '../lib/useSectionProgress'

const DURATION = 47 // seconds of source reel (trimmed)

const CHAPTERS = [
  {
    at: 0,
    no: '01',
    title: 'BACKSTAGE',
    text: 'Smoked eyes, steady hands. The face is being assembled before the light hits it.',
  },
  {
    at: 0.22,
    no: '02',
    title: 'RED PROJECTION',
    text: 'A perforated red beam swallows the dress. She stands still — the light does the walking.',
  },
  {
    at: 0.48,
    no: '03',
    title: 'BETWEEN TAKES',
    text: 'The projector cools down to blue. Tripods, cables, a shutter clicking in the dark.',
  },
  {
    at: 0.76,
    no: '04',
    title: 'LAST LOOK',
    text: 'Red blinds across the collarbones, then only a silhouette against the flag of light.',
  },
]

function chapterIndex(p: number) {
  let idx = 0
  CHAPTERS.forEach((c, i) => {
    if (p >= c.at) idx = i
  })
  return idx
}

export default function Storyboard() {
  const section = useRef<HTMLElement>(null)
  const mainCanvas = useRef<HTMLCanvasElement>(null)
  const bgCanvas = useRef<HTMLCanvasElement>(null)
  const [frame, setFrame] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!frameCache.projector) {
      const urls = Array.from({ length: PROJECTOR_COUNT }, (_, i) => projectorFrame(i))
      preloadFrames(urls).then((imgs) => {
        frameCache.projector = imgs
      })
    }
  }, [])

  useSectionProgress(section, (p) => {
    setProgress(p)
    const imgs = frameCache.projector
    if (!imgs) return
    const idx = Math.min(imgs.length - 1, Math.floor(p * imgs.length))
    setFrame(idx)

    const img = imgs[idx]
    if (!img?.naturalWidth) return

    const main = mainCanvas.current
    if (main) {
      const ctx = main.getContext('2d')!
      ctx.drawImage(img, 0, 0, main.width, main.height)
    }
    const bg = bgCanvas.current
    if (bg) {
      const ctx = bg.getContext('2d')!
      ctx.drawImage(img, 0, 0, bg.width, bg.height)
    }
  })

  const ch = chapterIndex(progress)
  const seconds = progress * DURATION
  const tc = `00:${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
    Math.floor(seconds % 60),
  ).padStart(2, '0')}:${String(Math.floor((seconds % 1) * 24)).padStart(2, '0')}`

  const thumbs = [-2, -1, 0, 1, 2].map((off) => {
    const i = Math.min(PROJECTOR_COUNT - 1, Math.max(0, frame + off * 7))
    return { off, i }
  })

  return (
    <section ref={section} id="sequence" className="relative h-[520vh] bg-ink">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* blurred backdrop */}
        <canvas
          ref={bgCanvas}
          width={45}
          height={80}
          className="absolute inset-0 w-full h-full scale-125 blur-[50px] opacity-40"
        />
        <div className="absolute inset-0 bg-ink/30" />

        {/* main frame */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-[72vh] md:h-[78vh] aspect-[9/16]">
            <canvas ref={mainCanvas} width={720} height={1280} className="w-full h-full object-cover" />
            {/* viewfinder corners */}
            {['top-0 left-0 border-t border-l', 'top-0 right-0 border-t border-r', 'bottom-0 left-0 border-b border-l', 'bottom-0 right-0 border-b border-r'].map(
              (c) => (
                <span key={c} className={`absolute w-5 h-5 border-bone/70 ${c} -m-2`} />
              ),
            )}
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full font-mono text-[9px] tracking-[0.3em] text-bone/50">
              REC ● SEQ.01
            </span>
            <span className="absolute -bottom-2 left-0 translate-y-full font-mono text-[10px] tracking-[0.2em] text-bone/70 tabular-nums">
              FR {String(frame + 1).padStart(3, '0')} / {PROJECTOR_COUNT}
            </span>
            <span className="absolute -bottom-2 right-0 translate-y-full font-mono text-[10px] tracking-[0.2em] text-blood tabular-nums">
              {tc}
            </span>
          </div>
        </div>

        {/* left HUD — chapters */}
        <div className="absolute left-5 md:left-10 top-1/2 -translate-y-1/2 hidden md:block w-[280px]">
          <div className="font-mono text-[10px] tracking-[0.35em] text-bone/50 mb-6">
            SEQUENCE 01 — PROJECTOR REEL
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={ch}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.35 }}
            >
              <div className="font-display text-7xl text-blood leading-none">{CHAPTERS[ch].no}</div>
              <div className="font-display text-3xl text-bone mt-3 tracking-wide">
                {CHAPTERS[ch].title}
              </div>
              <p className="font-sans text-sm text-bone/60 mt-4 leading-relaxed max-w-[240px]">
                {CHAPTERS[ch].text}
              </p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-10 space-y-2">
            {CHAPTERS.map((c, i) => (
              <div
                key={c.no}
                className={`font-mono text-[10px] tracking-[0.3em] transition-colors duration-300 ${
                  i === ch ? 'text-bone' : 'text-bone/30'
                }`}
              >
                {c.no} — {c.title}
              </div>
            ))}
          </div>
        </div>

        {/* right HUD — film strip */}
        <div className="absolute right-5 md:right-10 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2">
          {thumbs.map(({ off, i }) => (
            <div
              key={off}
              className={`relative w-[72px] aspect-[9/16] overflow-hidden border transition-all duration-200 ${
                off === 0 ? 'border-blood opacity-100' : 'border-bone/20 opacity-40'
              }`}
            >
              <img src={projectorFrame(i)} alt="" className="w-full h-full object-cover" loading="lazy" />
              <span className="absolute bottom-0.5 right-1 font-mono text-[8px] text-bone/80 tabular-nums">
                {String(i + 1).padStart(3, '0')}
              </span>
            </div>
          ))}
        </div>

        {/* bottom progress */}
        <div className="absolute bottom-6 inset-x-5 md:inset-x-10">
          <div className="h-px bg-bone/15 relative">
            <div className="absolute inset-y-0 left-0 bg-blood" style={{ width: `${progress * 100}%` }} />
            {CHAPTERS.map((c) => (
              <span
                key={c.no}
                className="absolute top-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full bg-bone/60"
                style={{ left: `${c.at * 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
