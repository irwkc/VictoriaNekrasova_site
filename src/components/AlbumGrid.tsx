import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import PolaroidFrame from './PolaroidFrame'
import { isVideoSrc, type AlbumItem } from '../lib/content'
import { useLocale } from '../context/LocaleProvider'

type Props = {
  items: AlbumItem[]
}

export default function AlbumGrid({ items }: Props) {
  const { t } = useLocale()
  const [lightbox, setLightbox] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <p className="font-mono text-[10px] tracking-[0.3em] text-bone/30 py-24 text-center border border-dashed border-bone/10">
        {t.albumPage.comingSoon}
      </p>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 auto-rows-[46vw] md:auto-rows-[20vw]">
        {items.map((item, i) => (
          <motion.figure
            key={item.src}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-4%' }}
            transition={{ duration: 0.45, delay: (i % 6) * 0.04 }}
            className="relative flex items-center justify-center cursor-pointer"
            data-hover
            onClick={() => setLightbox(item.src)}
          >
            {isVideoSrc(item.src) ? (
              <div className="relative h-full w-auto max-w-full aspect-[88/107] bg-[#f2efe8] p-2 flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.38)]">
                <video
                  src={item.src}
                  className="flex-1 min-h-0 w-full object-cover"
                  muted
                  playsInline
                  loop
                  preload="metadata"
                />
                <span className="mt-2 font-mono text-[8px] tracking-[0.2em] text-ink/50 truncate">
                  {item.cap || t.albumPage.clip}
                </span>
              </div>
            ) : (
              <PolaroidFrame src={item.src} alt={item.cap} index={i} caption={item.cap || undefined} />
            )}
          </motion.figure>
        ))}
      </div>

      <AnimatePresence>
        {lightbox && !isVideoSrc(lightbox) && (
          <motion.div
            className="fixed inset-0 z-[90] bg-ink/92 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.img
              src={lightbox}
              alt={items.find((i) => i.src === lightbox)?.cap || t.albumPage.photo}
              className="max-w-full max-h-[90vh] object-contain shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label={t.albumPage.closeLightbox}
              className="absolute top-6 right-6 font-mono text-xs text-bone/60 hover:text-bone"
            >
              ✕
            </button>
          </motion.div>
        )}
        {lightbox && isVideoSrc(lightbox) && (
          <motion.div
            className="fixed inset-0 z-[90] bg-ink/92 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <video
              src={lightbox}
              className="max-w-full max-h-[90vh]"
              controls
              autoPlay
              playsInline
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label={t.albumPage.closeVideo}
              className="absolute top-6 right-6 font-mono text-xs text-bone/60 hover:text-bone"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
