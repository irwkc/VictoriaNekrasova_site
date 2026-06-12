import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { preloadImages } from '../lib/frames'

const ASSETS = ['/photos/dapple1.jpg', '/photos/face_cut.png']
const MIN_DURATION = 1400

export default function Preloader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    let alive = true
    const start = performance.now()
    let real = 0

    // tween the counter to 100 over MIN_DURATION while assets load
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
      setLeaving(true)
      setTimeout(onDone, 900)
    })
    return () => {
      alive = false
      clearInterval(raf)
    }
  }, [onDone])

  return (
    <AnimatePresence>
      {!leaving ? (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[100] bg-ink flex flex-col items-center justify-center"
          exit={{ opacity: 0 }}
        >
          <Inner pct={pct} />
        </motion.div>
      ) : (
        <motion.div
          key="curtain"
          className="fixed inset-0 z-[100] bg-ink flex flex-col items-center justify-center"
          initial={{ y: 0 }}
          animate={{ y: '-100%' }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        >
          <Inner pct={100} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Inner({ pct }: { pct: number }) {
  return (
    <>
      <div className="font-mono text-[10px] tracking-[0.35em] text-bone/50 mb-6">
        LOADING SEQUENCE
      </div>
      <div className="font-display text-[13vw] leading-none select-none">
        <span className="text-bone">VN</span>
        <span className="text-blood">.</span>
      </div>
      <div className="mt-8 w-[200px] h-px bg-bone/15 relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-blood transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-3 font-mono text-xs text-bone/60 tabular-nums">{pct}%</div>
    </>
  )
}
