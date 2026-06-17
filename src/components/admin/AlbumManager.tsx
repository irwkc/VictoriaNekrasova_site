import { useRef, useState } from 'react'
import {
  ALBUM_CATEGORIES,
  deleteMedia,
  isVideoSrc,
  uploadPhoto,
  type AlbumId,
  type AlbumItem,
  type SiteContent,
} from '../../lib/content'
import { ru } from '../../i18n/locales/ru'

type Props = {
  albums: SiteContent['albums']
  onChange: (albums: SiteContent['albums']) => void
  onError: (message: string) => void
}

export default function AlbumManager({ albums, onChange, onError }: Props) {
  const [active, setActive] = useState<AlbumId>('photoshoots')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const items = albums[active] ?? []

  const updateAlbum = (id: AlbumId, next: AlbumItem[]) => {
    onChange({ ...albums, [id]: next })
  }

  const onUpload = async (file: File) => {
    setUploading(true)
    try {
      const url = await uploadPhoto(file, active)
      updateAlbum(active, [...items, { src: url, cap: '' }])
    } catch {
      onError('Upload failed. Check API is running and you are logged in.')
    } finally {
      setUploading(false)
    }
  }

  const removeItem = async (index: number) => {
    const item = items[index]
    if (!item) return
    try {
      await deleteMedia(item.src)
    } catch {
      /* file may already be gone */
    }
    updateAlbum(
      active,
      items.filter((_, i) => i !== index),
    )
  }

  return (
    <section>
      <SectionTitle n="03" title="PORTFOLIO ALBUMS" sub="Public folders — tests, shoots, shows, backstage, clips" />

      <div className="flex flex-wrap gap-2 mt-8 mb-6">
        {ALBUM_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActive(cat.id)}
            className={`font-mono text-[9px] tracking-[0.2em] px-3 py-2 border transition-colors ${
              active === cat.id
                ? 'border-blood text-blood'
                : 'border-bone/20 text-bone/50 hover:border-bone/40'
            }`}
          >
            {ru.albums[cat.id]}
            <span className="ml-1.5 opacity-50">({albums[cat.id]?.length ?? 0})</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <input
          ref={fileRef}
          type="file"
          accept={active === 'clips' ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/webp'}
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
          className={btnPrimary}
        >
          {uploading ? 'UPLOADING…' : `+ UPLOAD TO ${ru.albums[active]}`}
        </button>
        <span className="font-mono text-[9px] text-bone/30">
          /photos/albums/{active}/
        </span>
      </div>

      {items.length === 0 ? (
        <p className="font-mono text-[10px] tracking-[0.2em] text-bone/30 py-12 text-center border border-dashed border-bone/10">
          NO FILES — UPLOAD {active === 'clips' ? 'VIDEO' : 'PHOTOS'}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <div key={item.src} className="border border-bone/10 bg-bone/[0.02] p-3 space-y-2">
              <div className="aspect-[3/4] overflow-hidden bg-ink">
                {isVideoSrc(item.src) ? (
                  <video src={item.src} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <img src={item.src} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <input
                value={item.cap}
                onChange={(e) => {
                  const next = items.map((it, j) => (j === i ? { ...it, cap: e.target.value } : it))
                  updateAlbum(active, next)
                }}
                placeholder="Caption (optional)"
                className={input}
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="font-mono text-[9px] tracking-[0.2em] text-bone/35 hover:text-blood"
              >
                REMOVE
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function SectionTitle({ n, title, sub }: { n: string; title: string; sub: string }) {
  return (
    <div>
      <div className="font-display text-5xl text-blood leading-none">{n}</div>
      <h1 className="font-display text-2xl tracking-wide mt-2">{title}</h1>
      <p className="font-mono text-[10px] tracking-[0.25em] text-bone/40 mt-2">{sub}</p>
    </div>
  )
}

const input =
  'w-full bg-transparent border border-bone/20 px-2 py-1.5 font-mono text-[10px] text-bone focus:border-blood outline-none'
const btnPrimary =
  'font-mono text-[10px] tracking-[0.25em] border border-blood bg-blood text-ink px-4 py-2 hover:bg-transparent hover:text-blood transition-colors cursor-pointer disabled:opacity-40'
