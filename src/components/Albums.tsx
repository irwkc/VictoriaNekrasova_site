import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useMemo } from 'react'
import { useContent } from '../context/ContentProvider'
import { ALBUM_CATEGORIES } from '../lib/content'
import { useLocale } from '../context/LocaleProvider'

export default function Albums() {
  const { content } = useContent()
  const { t, albumLabel } = useLocale()

  const total = useMemo(
    () => ALBUM_CATEGORIES.reduce((n, c) => n + (content.albums[c.id]?.length ?? 0), 0),
    [content.albums],
  )

  return (
    <section id="portfolio" className="relative bg-ink px-5 md:px-10 py-28 border-t border-bone/10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
        <h2 className="font-display text-[12vw] md:text-[7vw] leading-[0.85]">
          {t.albums.port}
          <br />
          <span className="outline-text">{t.albums.folio}</span>
        </h2>
        <p className="font-mono text-[10px] tracking-[0.35em] text-bone/50 md:text-right leading-relaxed">
          {String(total).padStart(2, '0')} {t.albums.assets}
          <br />
          {t.albums.open}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {ALBUM_CATEGORIES.map((cat, i) => {
          const items = content.albums[cat.id] ?? []
          const cover = items[0]?.src

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8%' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <Link
                to={`/portfolio/${cat.id}`}
                className="group block border border-bone/15 hover:border-blood transition-colors duration-300"
                data-hover
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-bone/[0.03]">
                  {cover ? (
                    isVideoCover(cover) ? (
                      <video
                        src={cover}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
                        muted
                        playsInline
                        loop
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={cover}
                        alt=""
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] tracking-[0.35em] text-bone/25">
                      {t.albums.empty}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-ink/20 group-hover:bg-ink/0 transition-colors duration-300" />
                </div>
                <div className="flex items-center justify-between px-4 py-4 border-t border-bone/10">
                  <span className="font-mono text-[10px] md:text-[11px] tracking-[0.28em] text-bone group-hover:text-blood transition-colors">
                    {albumLabel(cat.id)}
                  </span>
                  <span className="font-mono text-[9px] tracking-[0.2em] text-bone/40">
                    {items.length} →
                  </span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

function isVideoCover(src: string) {
  return /\.(mp4|webm|mov)$/i.test(src)
}
