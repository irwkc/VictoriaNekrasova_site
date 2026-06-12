import { useEffect, useState, type PointerEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { preloadImages } from '../lib/frames'
import { preloadVideos, unlockAllMedia } from '../lib/unlockMedia'

const ASSETS = ['/photos/dapple1.jpg', '/photos/face_cut.png']
const MIN_DURATION = 1400

type Phase = 'loading' | 'enter' | 'exit'

export default function Preloader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0)
  const [phase, setPhase] = useState<Phase>('loading')

  useEffect(() => {
    preloadVideos(['/videos/projector.mp4', '/videos/face.mp4'])
  }, [])

  useEffect(() => {
    let alive = true
    const start = performance.now()
    let real = 0

    const raf = setInterval(() => {
      if (!alive) return
      const timed = Math.min(1, (performance.now() - start) / MIN_DURATION)
      setPct(Math.round(Math.min(timed, Math.max(timed * 0.7, real)) * 100))
    }, 40)

    const delay = new Promise((r) => setTimeout(r, MIN_DURATION))
    const load = preloadImages(ASSETS, (loaded, total) => {
      real = loaded / total
    })

    Promise.all([load, delay]).then(() => {
      if (!alive) return
      clearInterval(raf)
      setPct(100)
      setPhase('enter')
    })
    return () => {
      alive = false
      clearInterval(raf)
    }
  }, [])

  const enter = (e: PointerEvent) => {
    if (phase !== 'enter') return
    e.preventDefault()
    // Safari: play() must run in the same task as the user gesture
    unlockAllMedia()
    setPhase('exit')
    window.setTimeout(onDone, 900)
  }

  return (
    <AnimatePresence>
      {phase !== 'exit' ? (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[100] bg-ink flex flex-col items-center justify-center cursor-pointer"
          onPointerDown={enter}
          exit={{ opacity: 0 }}
        >
          <Inner pct={pct} showEnter={phase === 'enter'} />
        </motion.div>
      ) : (
        <motion.div
          key="curtain"
          className="fixed inset-0 z-[100] bg-ink flex flex-col items-center justify-center pointer-events-none"
          initial={{ y: 0 }}
          animate={{ y: '-100%' }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        >
          <Inner pct={100} showEnter={false} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Inner({ pct, showEnter }: { pct: number; showEnter: boolean }) {
  return (
    <>
      <div className="font-mono text-[10px] tracking-[0.35em] text-bone/50 mb-6">
        LOADING SEQUENCE
      </div>
      <div className="font-display text-[13vw] leading-none select-none pointer-events-none">
        <span className="text-bone">VN</span>
        <span className="text-blood">.</span>
      </div>
      <div className="mt-8 w-[200px] h-px bg-bone/15 relative overflow-hidden pointer-events-none">
        <div
          className="absolute inset-y-0 left-0 bg-blood transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-3 font-mono text-xs text-bone/60 tabular-nums pointer-events-none">
        {pct}%
      </div>
      {showEnter && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-10 font-mono text-[10px] tracking-[0.45em] text-bone pointer-events-none"
        >
          TAP TO ENTER
          <motion.span
            className="inline-block ml-2 text-blood"
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            ↓
          </motion.span>
        </motion.div>
      )}
    </>
  )
}
