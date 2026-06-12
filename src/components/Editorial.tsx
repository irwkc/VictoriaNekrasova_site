import { motion } from 'motion/react'

export default function Editorial() {
  return (
    <section id="editorial" className="bg-bone text-ink">
      <Manifesto />
      <FaceReel />
    </section>
  )
}

function Manifesto() {
  return (
    <div className="px-5 md:px-10 py-28 md:py-40 max-w-[1200px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15%' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="font-mono text-[10px] tracking-[0.35em] text-ink/50 mb-10">
          ( MANIFESTO )
        </div>
        <p className="font-serif italic text-[7.5vw] md:text-[4.2vw] leading-[1.05]">
          Some beauties are meant to be <span className="text-blood">felt</span>, not captured.
          She moves through the silence and leaves nothing but a{' '}
          <span className="outline-text-ink not-italic font-display tracking-wide">BLUR</span> of
          elegance behind.
        </p>
        <div className="mt-12 flex flex-wrap gap-x-12 gap-y-3 font-mono text-[10px] tracking-[0.3em] text-ink/60">
          <span>EYES NEVER LIE</span>
          <span>100% ACCURACY</span>
          <span>STATE OF MIND — WILD</span>
          <span>EST. 2026</span>
        </div>
      </motion.div>
    </div>
  )
}

function FaceReel() {
  return (
    <div className="relative">
      <div className="relative h-screen overflow-hidden flex items-center justify-center">
        {/* poster type behind */}
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
          <span className="font-display text-[24vw] leading-[0.8] text-ink/90 -translate-x-[14vw]">
            CLOSE
          </span>
          <span className="font-display text-[24vw] leading-[0.8] outline-text-ink translate-x-[14vw]">
            UP
          </span>
        </div>

        {/* source reel */}
        <div className="relative h-[64vh] md:h-[74vh] aspect-[3/4] shadow-[0_40px_120px_rgba(10,10,10,0.35)]">
          <video
            src="/videos/face.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
          <span className="absolute -left-2 top-6 -translate-x-full font-mono text-[9px] tracking-[0.3em] text-ink/60 [writing-mode:vertical-rl]">
            PARK BY OSIPCHUK — ORIGINAL REEL
          </span>
          <span className="absolute -right-2 bottom-6 translate-x-full font-mono text-[9px] tracking-[0.3em] text-ink/60 [writing-mode:vertical-rl]">
            LOOP — 7.2 SEC
          </span>
        </div>

        {/* small captions */}
        <span className="absolute left-5 md:left-10 top-24 font-mono text-[10px] tracking-[0.3em] text-ink/50">
          ( SEQUENCE 02 )
        </span>
        <span className="absolute right-5 md:right-10 top-24 font-mono text-[10px] tracking-[0.3em] text-ink/50">
          JUST FOR YOU
        </span>
        <span className="absolute bottom-8 left-5 md:left-10 font-serif italic text-xl md:text-2xl text-ink/80">
          i wanna be a good frame
        </span>
        <span className="absolute bottom-8 right-5 md:right-10 font-mono text-[10px] tracking-[0.3em] text-blood">
          ©2026 VN.ARCHIVE
        </span>
      </div>
    </div>
  )
}
