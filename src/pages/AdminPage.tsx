import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ADMIN_PASSWORD,
  DEFAULT_CONTENT,
  GALLERY_SPANS,
  PHOTO_LIBRARY,
  downloadContent,
  resetContent,
  saveContent,
  loadContent,
  type GalleryItem,
  type SiteContent,
} from '../lib/content'

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('vn-admin') === '1')
  const [draft, setDraft] = useState<SiteContent | null>(null)
  const [saved, setSaved] = useState(false)
  const [picker, setPicker] = useState<{ type: 'corridor'; index: number } | { type: 'gallery'; index: number } | null>(
    null,
  )

  useEffect(() => {
    document.body.classList.add('admin-route')
    return () => document.body.classList.remove('admin-route')
  }, [])

  if (!authed) return <Login onOk={() => setAuthed(true)} />

  if (!draft) return <AdminLoader onLoad={setDraft} />

  const setCorridor = (index: number, src: string) => {
    const corridor = [...draft.corridor]
    corridor[index] = src
    setDraft({ ...draft, corridor })
    setSaved(false)
    setPicker(null)
  }

  const setGallery = (index: number, patch: Partial<GalleryItem>) => {
    const gallery = draft.gallery.map((item, i) => (i === index ? { ...item, ...patch } : item))
    setDraft({ ...draft, gallery })
    setSaved(false)
    if (patch.src !== undefined) setPicker(null)
  }

  const handleSave = async () => {
    await saveContent(draft)
    setSaved(true)
  }

  const handleReset = () => {
    if (!confirm('Сбросить к дефолту?')) return
    resetContent()
    setDraft({ ...DEFAULT_CONTENT })
    setSaved(false)
  }

  return (
    <div className="min-h-screen bg-ink text-bone font-sans">
      <header className="sticky top-0 z-10 border-b border-bone/10 bg-ink/95 backdrop-blur px-5 md:px-10 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/" className="font-display text-xl tracking-wide">
            VN<span className="text-blood">.</span>
          </Link>
          <span className="ml-4 font-mono text-[10px] tracking-[0.35em] text-bone/50">ADMIN</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => downloadContent(draft)} className={btn}>
            EXPORT JSON
          </button>
          <button type="button" onClick={handleReset} className={btnGhost}>
            RESET
          </button>
          <button type="button" onClick={handleSave} className={btnPrimary}>
            {saved ? 'SAVED ✓' : 'SAVE'}
          </button>
        </div>
      </header>

      <div className="px-5 md:px-10 py-12 max-w-6xl mx-auto space-y-16">
        <section>
          <SectionTitle n="01" title="CORRIDOR" sub="12 frames in the 3D fly-through" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {draft.corridor.map((src, i) => (
              <Slot
                key={i}
                label={`${i + 1}`}
                src={src}
                onClick={() => setPicker({ type: 'corridor', index: i })}
              />
            ))}
          </div>
        </section>

        <section>
          <SectionTitle n="02" title="SELECTED STILLS" sub="Gallery grid on the main page" />
          <div className="space-y-4">
            {draft.gallery.map((item, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row gap-4 p-4 border border-bone/10 bg-bone/[0.02]"
              >
                <button
                  type="button"
                  onClick={() => setPicker({ type: 'gallery', index: i })}
                  className="shrink-0 w-full sm:w-28 aspect-[3/4] overflow-hidden border border-bone/20 hover:border-blood transition-colors"
                >
                  <img src={item.src} alt="" className="w-full h-full object-cover" />
                </button>
                <div className="flex-1 space-y-3">
                  <div className="font-mono text-[10px] tracking-[0.3em] text-bone/40">
                    FRAME {String(i + 1).padStart(2, '0')}
                  </div>
                  <label className="block">
                    <span className="font-mono text-[9px] tracking-[0.25em] text-bone/50">CAPTION</span>
                    <input
                      value={item.cap}
                      onChange={(e) => setGallery(i, { cap: e.target.value })}
                      className={input}
                    />
                  </label>
                  <label className="block">
                    <span className="font-mono text-[9px] tracking-[0.25em] text-bone/50">GRID SPAN</span>
                    <select
                      value={item.span}
                      onChange={(e) => setGallery(i, { span: e.target.value })}
                      className={input}
                    >
                      {GALLERY_SPANS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="font-mono text-[9px] text-bone/30 truncate">{item.src}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {picker && (
        <PhotoPicker
          current={
            picker.type === 'corridor' ? draft.corridor[picker.index] : draft.gallery[picker.index].src
          }
          onPick={(src) => {
            if (picker.type === 'corridor') setCorridor(picker.index, src)
            else setGallery(picker.index, { src })
          }}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  )
}

function AdminLoader({ onLoad }: { onLoad: (c: SiteContent) => void }) {
  const [err, setErr] = useState(false)

  useEffect(() => {
    loadContent().then(onLoad).catch(() => setErr(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  if (err) return <p className="p-10 text-blood font-mono text-sm">Failed to load content</p>
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center font-mono text-[10px] tracking-[0.35em] text-bone/50">
      LOADING…
    </div>
  )
}

function Login({ onOk }: { onOk: () => void }) {
  const [pass, setPass] = useState('')
  const [err, setErr] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pass === ADMIN_PASSWORD) {
      sessionStorage.setItem('vn-admin', '1')
      onOk()
    } else {
      setErr(true)
    }
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-5">
      <Link to="/" className="font-display text-4xl mb-10">
        VN<span className="text-blood">.</span>
      </Link>
      <form onSubmit={submit} className="w-full max-w-xs space-y-4">
        <label className="block font-mono text-[10px] tracking-[0.35em] text-bone/50">PASSWORD</label>
        <input
          type="password"
          value={pass}
          onChange={(e) => {
            setPass(e.target.value)
            setErr(false)
          }}
          className={input}
          autoFocus
        />
        {err && <p className="font-mono text-xs text-blood">Wrong password</p>}
        <button type="submit" className={`${btnPrimary} w-full`}>
          ENTER ADMIN
        </button>
      </form>
      <p className="mt-6 font-mono text-[9px] tracking-[0.2em] text-bone/30">
        trial password: admin
      </p>
      <Link to="/" className="mt-4 font-mono text-[10px] tracking-[0.3em] text-bone/40 hover:text-bone">
        ← BACK TO SITE
      </Link>
    </div>
  )
}

function SectionTitle({ n, title, sub }: { n: string; title: string; sub: string }) {
  return (
    <div className="mb-8">
      <div className="font-display text-5xl text-blood leading-none">{n}</div>
      <h1 className="font-display text-2xl tracking-wide mt-2">{title}</h1>
      <p className="font-mono text-[10px] tracking-[0.25em] text-bone/40 mt-2">{sub}</p>
    </div>
  )
}

function Slot({ label, src, onClick }: { label: string; src: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-[3/4] overflow-hidden border border-bone/15 hover:border-blood transition-colors cursor-pointer"
    >
      <img src={src} alt="" className="w-full h-full object-cover" />
      <span className="absolute top-2 left-2 font-mono text-[9px] tracking-[0.2em] text-bone bg-ink/70 px-1.5 py-0.5">
        {label}
      </span>
      <span className="absolute inset-0 flex items-center justify-center bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[9px] tracking-[0.3em]">
        CHANGE
      </span>
    </button>
  )
}

function PhotoPicker({
  current,
  onPick,
  onClose,
}: {
  current: string
  onPick: (src: string) => void
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-ink border border-bone/15 w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-bone/10">
          <span className="font-mono text-[10px] tracking-[0.35em] text-bone/50">PICK PHOTO</span>
          <button type="button" onClick={onClose} className="font-mono text-xs text-bone/60 hover:text-bone">
            ✕
          </button>
        </div>
        <div className="overflow-y-auto p-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
          {PHOTO_LIBRARY.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => onPick(src)}
              className={`aspect-[3/4] overflow-hidden border-2 transition-colors cursor-pointer ${
                src === current ? 'border-blood' : 'border-transparent hover:border-bone/40'
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const input =
  'mt-1 w-full bg-transparent border border-bone/20 px-3 py-2 font-mono text-xs text-bone focus:border-blood outline-none'
const btn =
  'font-mono text-[10px] tracking-[0.25em] border border-bone/30 px-4 py-2 hover:border-bone transition-colors cursor-pointer'
const btnGhost =
  'font-mono text-[10px] tracking-[0.25em] border border-bone/15 px-4 py-2 text-bone/50 hover:text-bone hover:border-bone/40 transition-colors cursor-pointer'
const btnPrimary =
  'font-mono text-[10px] tracking-[0.25em] border border-blood bg-blood text-ink px-4 py-2 hover:bg-transparent hover:text-blood transition-colors cursor-pointer'
