import { motion } from 'motion/react'
import PolaroidFrame from './PolaroidFrame'
import { useContent } from '../context/ContentProvider'

export default function Gallery() {
  const { content } = useContent()
  const items = content.gallery

  return (
    <section className="relative bg-ink px-5 md:px-10 py-28">
      <div className="flex items-end justify-between mb-14">
        <h2 className="font-display text-[12vw] md:text-[7vw] leading-[0.85]">
          SELECTED
          <br />
          <span className="outline-text">STILLS</span>
        </h2>
        <div className="hidden md:block font-mono text-[10px] tracking-[0.35em] text-bone/50 text-right leading-relaxed">
          {String(items.length).padStart(2, '0')} FRAMES / PAUSED MOTION
          <br />
          HOVER TO REVEAL
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-12 gap-4 md:gap-5 auto-rows-[46vw] md:auto-rows-[28vw]">
        {items.map((item, i) => (
          <motion.figure
            key={`${item.src}-${i}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-8%' }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className={`group relative flex items-center justify-center ${item.span}`}
            data-hover
          >
            <PolaroidFrame
              src={item.src}
              alt={item.cap}
              index={i}
              caption={
                <>
                  <span>{item.cap}</span>
                  <span className="text-blood">{String(i + 1).padStart(2, '0')}</span>
                </>
              }
            />
          </motion.figure>
        ))}
      </div>
    </section>
  )
}
