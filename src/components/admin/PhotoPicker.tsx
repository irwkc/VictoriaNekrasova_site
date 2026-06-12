import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { fetchPhotoLibrary, uploadPhoto } from '../../lib/content'

type Props = {
  current: string
  onPick: (src: string) => void
  onClose: () => void
  onError?: (message: string) => void
}

export default function PhotoPicker({ current, onPick, onClose, onError }: Props) {
  const [photos, setPhotos] = useState<string[]>([])
  const [hover, setHover] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPhotoLibrary().then(setPhotos)
  }, [])

  const preview = hover ?? current

  const onUpload = async (file: File) => {
    setUploading(true)
    try {
      const url = await uploadPhoto(file)
      setPhotos((p) => (p.includes(url) ? p : [url, ...p]))
      onPick(url)
    } catch {
      onError?.('Run via npm run dev to save uploaded files locally.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-ink border border-bone/15 w-full max-w-4xl max-h-[88vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-bone/10 shrink-0">
          <span className="font-mono text-[10px] tracking-[0.35em] text-bone/50">PICK PHOTO</span>
          <div className="flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) onUpload(f)
                e.target.value = ''
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="font-mono text-[9px] tracking-[0.25em] border border-bone/30 px-3 py-1.5 hover:border-blood transition-colors disabled:opacity-40"
            >
              {uploading ? 'UPLOADING…' : '+ UPLOAD'}
            </button>
            <button type="button" onClick={onClose} className="font-mono text-xs text-bone/60 hover:text-bone">
              ✕
            </button>
          </div>
        </div>

        {/* hover preview */}
        <div className="relative shrink-0 h-[38vh] sm:h-[42vh] border-b border-bone/10 bg-bone/[0.03] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={preview}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center p-4"
            >
              <img
                src={preview}
                alt=""
                className="max-w-full max-h-full object-contain shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-3 left-4 font-mono text-[9px] tracking-[0.25em] text-bone/40 truncate max-w-[80%]">
            {preview}
          </div>
        </div>

        <div className="overflow-y-auto p-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {photos.map((src) => (
            <button
              key={src}
              type="button"
              onMouseEnter={() => setHover(src)}
              onFocus={() => setHover(src)}
              onClick={() => onPick(src)}
              className={`aspect-[3/4] overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                src === current
                  ? 'border-blood scale-[0.98]'
                  : hover === src
                    ? 'border-bone scale-105 z-10'
                    : 'border-transparent hover:border-bone/40'
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
