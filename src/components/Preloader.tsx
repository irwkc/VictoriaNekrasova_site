import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { preloadImages } from '../lib/frames'
import { preloadVideos, unlockAllMedia } from '../lib/unlockMedia'
import { useLocale, type Locale } from '../context/LocaleProvider'

const ASSETS = ['/photos/dapple1.jpg', '/photos/face_cut.png']
const MIN_DURATION = 1400
const CURTAIN_MS = 850

type Phase = 'loading' | 'choose' | 'exit'

type Props = {
  onReveal: () => void
  onDone: () => void
}

export default function Preloader({ onReveal, onDone }: Props) {
  const { t, setLocale } = useLocale()
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
      setPhase('choose')
    })
    return () => {
      alive = false
      clearInterval(raf)
    }
  }, [])

  const pick = (locale: Locale) => {
    setLocale(locale)
    unlockAllMedia()
    onReveal()
    setPhase('exit')
  }

  if (phase === 'exit') {
    return (
      <motion.div
        className="fixed inset-0 z-[100] bg-ink flex flex-col items-center justify-center pointer-events-none"
        initial={{ y: 0 }}
        animate={{ y: '-100%' }}
        transition={{ duration: CURTAIN_MS / 1000, ease: [0.76, 0, 0.24, 1] }}
        onAnimationComplete={onDone}
      >
        <Inner pct={100} showChoose={false} t={t} onPick={pick} />
      </motion.div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-ink flex flex-col items-center justify-center">
      <Inner pct={pct} showChoose={phase === 'choose'} t={t} onPick={pick} />
    </div>
  )
}

function Inner({
  pct,
  showChoose,
  t,
  onPick,
}: {
  pct: number
  showChoose: boolean
  t: ReturnType<typeof useLocale>['t']
  onPick: (locale: Locale) => void
}) {
  return (
    <>
      <div className="font-mono text-[10px] tracking-[0.35em] text-bone/50 mb-6">
        {t.preloader.loading}
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
      {showChoose && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <p className="font-mono text-[10px] tracking-[0.45em] text-bone/50">{t.preloader.chooseLang}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onPick('ru')}
              data-hover
              className="font-mono text-[10px] tracking-[0.35em] border border-bone/40 px-6 py-3 text-bone hover:bg-bone hover:text-ink transition-colors duration-200"
            >
              {t.preloader.ru}
            </button>
            <button
              type="button"
              onClick={() => onPick('en')}
              data-hover
              className="font-mono text-[10px] tracking-[0.35em] border border-blood/60 px-6 py-3 text-bone hover:bg-blood hover:text-bone transition-colors duration-200"
            >
              {t.preloader.en}
            </button>
          </div>
        </motion.div>
      )}
    </>
  )
}
