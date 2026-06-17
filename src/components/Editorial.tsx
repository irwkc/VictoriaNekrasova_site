import { motion } from 'motion/react'
import AutoVideo from './AutoVideo'
import { useLocale } from '../context/LocaleProvider'

export default function Editorial() {
  return (
    <section id="editorial" className="bg-bone text-ink">
      <Manifesto />
      <FaceReel />
    </section>
  )
}

function Manifesto() {
  const { t } = useLocale()

  return (
    <div className="px-5 md:px-10 py-28 md:py-40 max-w-[1200px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15%' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="font-mono text-[10px] tracking-[0.35em] text-ink/50 mb-10">
          {t.editorial.manifestoLabel}
        </div>
        <p className="font-serif italic text-[7.5vw] md:text-[4.2vw] leading-[1.05]">
          Some beauties are meant to be <span className="text-blood">{t.editorial.manifestoFelt}</span>, not
          captured. She moves through the silence and leaves nothing but a{' '}
          <span className="outline-text-ink not-italic font-display tracking-wide">{t.editorial.manifestoBlur}</span>{' '}
          of elegance behind.
        </p>
        <div className="mt-12 flex flex-wrap gap-x-12 gap-y-3 font-mono text-[10px] tracking-[0.3em] text-ink/60">
          {t.editorial.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function FaceReel() {
  const { t } = useLocale()

  return (
    <div className="relative">
      <div className="relative h-screen overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
          <span className="font-display text-[24vw] leading-[0.8] text-ink/90 -translate-x-[14vw]">
            {t.editorial.closeUp}
          </span>
          <span className="font-display text-[24vw] leading-[0.8] outline-text-ink translate-x-[14vw]">
            {t.editorial.up}
          </span>
        </div>

        <div className="relative h-[64vh] md:h-[74vh] aspect-[3/4] shadow-[0_40px_120px_rgba(10,10,10,0.35)] pointer-events-none select-none">
          <AutoVideo src="/videos/face.mp4" className="w-full h-full object-cover" />
          <span className="absolute -left-2 top-6 -translate-x-full font-mono text-[9px] tracking-[0.3em] text-ink/60 [writing-mode:vertical-rl]">
            {t.editorial.reelLabel}
          </span>
          <span className="absolute -right-2 bottom-6 translate-x-full font-mono text-[9px] tracking-[0.3em] text-ink/60 [writing-mode:vertical-rl]">
            {t.editorial.loop}
          </span>
        </div>

        <span className="absolute left-5 md:left-10 top-24 font-mono text-[10px] tracking-[0.3em] text-ink/50">
          {t.editorial.sequence}
        </span>
        <span className="absolute right-5 md:right-10 top-24 font-mono text-[10px] tracking-[0.3em] text-ink/50">
          {t.editorial.justForYou}
        </span>
        <span className="absolute bottom-8 left-5 md:left-10 font-serif italic text-xl md:text-2xl text-ink/80">
          {t.editorial.caption}
        </span>
        <span className="absolute bottom-8 right-5 md:right-10 font-mono text-[10px] tracking-[0.3em] text-blood">
          {t.editorial.copyright}
        </span>
      </div>
    </div>
  )
}
