import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import AutoVideo from './AutoVideo'
import { useLocale } from '../context/LocaleProvider'

function chapterIndex(p: number, chapters: { at: number }[]) {
  let idx = 0
  chapters.forEach((c, i) => {
    if (p >= c.at) idx = i
  })
  return idx
}

const CHAPTER_AT = [0, 0.22, 0.48, 0.76]

export default function Storyboard() {
  const { t } = useLocale()
  const chapters = t.storyboard.chapters.map((c, i) => ({ ...c, at: CHAPTER_AT[i]! }))
  const video = useRef<HTMLVideoElement>(null)
  const [progress, setProgress] = useState(0)

  const onTime = () => {
    const v = video.current
    if (v?.duration) setProgress(v.currentTime / v.duration)
  }

  const ch = chapterIndex(progress, chapters)
  const v = video.current
  const tSec = v ? v.currentTime : 0
  const tc = `00:${String(Math.floor(tSec / 60)).padStart(2, '0')}:${String(
    Math.floor(tSec % 60),
  ).padStart(2, '0')}:${String(Math.floor((tSec % 1) * 24)).padStart(2, '0')}`

  return (
    <section id="sequence" className="relative h-screen bg-ink overflow-hidden">
      <img
        src="/photos/seq_bg.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-40 select-none"
      />
      <div className="absolute inset-0 bg-ink/30" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-[72vh] md:h-[78vh] aspect-[9/16] pointer-events-none select-none">
          <AutoVideo
            ref={video}
            src="/videos/projector.mp4"
            onTimeUpdate={onTime}
            className="w-full h-full object-cover"
          />
          {['top-0 left-0 border-t border-l', 'top-0 right-0 border-t border-r', 'bottom-0 left-0 border-b border-l', 'bottom-0 right-0 border-b border-r'].map(
            (c) => (
              <span key={c} className={`absolute w-5 h-5 border-bone/70 ${c} -m-2`} />
            ),
          )}
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full font-mono text-[9px] tracking-[0.3em] text-bone/50">
            {t.storyboard.rec}
          </span>
          <span className="absolute -bottom-2 left-0 translate-y-full font-mono text-[10px] tracking-[0.2em] text-bone/70 tabular-nums">
            {t.storyboard.frames} {String(Math.floor(tSec * 3) + 1).padStart(3, '0')} / 140
          </span>
          <span className="absolute -bottom-2 right-0 translate-y-full font-mono text-[10px] tracking-[0.2em] text-blood tabular-nums">
            {tc}
          </span>
        </div>
      </div>

      <div className="absolute left-5 md:left-10 top-1/2 -translate-y-1/2 hidden md:block w-[280px]">
        <div className="font-mono text-[10px] tracking-[0.35em] text-bone/50 mb-6">
          {t.storyboard.hudTitle}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={ch}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.35 }}
          >
            <div className="font-display text-7xl text-blood leading-none">{chapters[ch].no}</div>
            <div className="font-display text-3xl text-bone mt-3 tracking-wide">
              {chapters[ch].title}
            </div>
            <p className="font-sans text-sm text-bone/60 mt-4 leading-relaxed max-w-[240px]">
              {chapters[ch].text}
            </p>
          </motion.div>
        </AnimatePresence>
        <div className="mt-10 space-y-2">
          {chapters.map((c, i) => (
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

      <div className="absolute bottom-6 inset-x-5 md:inset-x-10">
        <div className="h-px bg-bone/15 relative">
          <div className="absolute inset-y-0 left-0 bg-blood" style={{ width: `${progress * 100}%` }} />
          {chapters.map((c) => (
            <span
              key={c.no}
              className="absolute top-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full bg-bone/60"
              style={{ left: `${c.at * 100}%` }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
