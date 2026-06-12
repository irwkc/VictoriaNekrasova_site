import { motion } from 'motion/react'

const ITEMS = [
  { src: '/photos/chains2.jpg', cap: 'MOB JOURNAL — VOL.13', span: 'md:col-span-5 md:row-span-2' },
  { src: '/photos/suit1.jpg', cap: 'TAILORING STUDY — B/W', span: 'md:col-span-4' },
  { src: '/photos/red2.jpg', cap: 'BLAZER / RED ROOM', span: 'md:col-span-3' },
  { src: '/photos/sheer1.jpg', cap: 'PARK BY OSIPCHUK', span: 'md:col-span-3' },
  { src: '/photos/tux3.jpg', cap: 'LE SMOKING — 35MM', span: 'md:col-span-4' },
  { src: '/photos/coat2.jpg', cap: 'RAINCOAT — STUDIO', span: 'md:col-span-4 md:row-span-2' },
  { src: '/photos/crop3.jpg', cap: 'DENIM / OFF-DUTY', span: 'md:col-span-4' },
  { src: '/photos/chains4.jpg', cap: 'GOLD CHAINS — DETAIL', span: 'md:col-span-4' },
  { src: '/photos/sheer3.jpg', cap: 'MESH — RED LIP', span: 'md:col-span-4' },
]

export default function Gallery() {
  return (
    <section className="relative bg-ink px-5 md:px-10 py-28">
      <div className="flex items-end justify-between mb-14">
        <h2 className="font-display text-[12vw] md:text-[7vw] leading-[0.85]">
          SELECTED
          <br />
          <span className="outline-text">STILLS</span>
        </h2>
        <div className="hidden md:block font-mono text-[10px] tracking-[0.35em] text-bone/50 text-right leading-relaxed">
          09 FRAMES / PAUSED MOTION
          <br />
          HOVER TO UNBLUR
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4 auto-rows-[40vw] md:auto-rows-[26vw]">
        {ITEMS.map((item, i) => (
          <motion.figure
            key={item.src}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-8%' }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className={`group relative overflow-hidden ${item.span}`}
            data-hover
          >
            <img
              src={item.src}
              alt={item.cap}
              loading="lazy"
              className="w-full h-full object-cover grayscale blur-[2px] scale-[1.04] transition-all duration-500 ease-out group-hover:grayscale-0 group-hover:blur-0 group-hover:scale-100"
            />
            <figcaption className="absolute bottom-0 inset-x-0 flex items-center justify-between px-3 py-2 bg-gradient-to-t from-ink/80 to-transparent font-mono text-[9px] tracking-[0.25em] text-bone/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>{item.cap}</span>
              <span className="text-blood">{String(i + 1).padStart(2, '0')}</span>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  )
}
