import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { frameCache, preloadFrames, projectorFrame, PROJECTOR_COUNT } from '../lib/frames'

export default function Preloader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    let alive = true
    const urls = Array.from({ length: PROJECTOR_COUNT }, (_, i) => projectorFrame(i))
    preloadFrames(['/photos/dapple1.jpg', ...urls], (loaded, total) => {
      if (alive) setPct(Math.round((loaded / total) * 100))
    }).then((imgs) => {
      if (!alive) return
      frameCache.projector = imgs.slice(1)
      setLeaving(true)
      setTimeout(onDone, 900)
    })
    return () => {
      alive = false
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
