import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ADMIN_PASSWORD,
  DEFAULT_CONTENT,
  GALLERY_SPANS,
  defaultGalleryItem,
  downloadContent,
  resetContent,
  saveContent,
  loadContent,
  type GalleryItem,
  type SiteContent,
} from '../lib/content'
import PhotoPicker from '../components/admin/PhotoPicker'
import AdminDialog, { type AdminDialogConfig } from '../components/admin/AdminDialog'
import PolaroidFrame from '../components/PolaroidFrame'

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('vn-admin') === '1')
  const [draft, setDraft] = useState<SiteContent | null>(null)
  const [saved, setSaved] = useState(false)
  const [picker, setPicker] = useState<{ type: 'corridor'; index: number } | { type: 'gallery'; index: number } | null>(
    null,
  )
  const [dialog, setDialog] = useState<(AdminDialogConfig & { open: true }) | null>(null)

  const closeDialog = () => setDialog(null)

  const showAlert = (title: string, message: string) => {
    setDialog({
      open: true,
      title,
      message,
      alert: true,
      onConfirm: closeDialog,
    })
  }

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

  const addGallery = () => {
    const gallery = [...draft.gallery, defaultGalleryItem()]
    setDraft({ ...draft, gallery })
    setSaved(false)
    setPicker({ type: 'gallery', index: gallery.length - 1 })
  }

  const removeGallery = (index: number) => {
    if (draft.gallery.length <= 1) {
      showAlert('CANNOT REMOVE', 'Selected Stills needs at least one frame.')
      return
    }
    setDialog({
      open: true,
      title: 'REMOVE FRAME',
      message: `Remove frame ${String(index + 1).padStart(2, '0')} from Selected Stills? This cannot be undone until you save.`,
      variant: 'danger',
      confirmLabel: 'REMOVE',
      onConfirm: () => {
        const gallery = draft.gallery.filter((_, i) => i !== index)
        setDraft({ ...draft, gallery })
        setSaved(false)
        setPicker(null)
        closeDialog()
      },
    })
  }

  const handleSave = async () => {
    await saveContent(draft)
    setSaved(true)
  }

  const handleReset = () => {
    setDialog({
      open: true,
      title: 'RESET CONTENT',
      message: 'Сбросить все изменения к дефолту? Несохранённые правки будут потеряны.',
      variant: 'danger',
      confirmLabel: 'RESET',
      onConfirm: () => {
        resetContent()
        setDraft({ ...DEFAULT_CONTENT })
        setSaved(false)
        closeDialog()
      },
    })
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-8">
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
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <SectionTitle n="02" title="SELECTED STILLS" sub="Gallery grid on the main page" />
            <button type="button" onClick={addGallery} className={btnPrimary}>
              + ADD FRAME
            </button>
          </div>
          <div className="space-y-4">
            {draft.gallery.map((item, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row gap-4 p-4 border border-bone/10 bg-bone/[0.02]"
              >
                <button
                  type="button"
                  onClick={() => setPicker({ type: 'gallery', index: i })}
                  className="shrink-0 w-full sm:w-28 aspect-[88/107] hover:opacity-90 transition-opacity"
                >
                  <PolaroidFrame src={item.src} alt={item.cap} flat className="h-full w-full" />
                </button>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-mono text-[10px] tracking-[0.3em] text-bone/40">
                      FRAME {String(i + 1).padStart(2, '0')}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGallery(i)}
                      className="font-mono text-[9px] tracking-[0.2em] text-bone/35 hover:text-blood transition-colors"
                    >
                      REMOVE
                    </button>
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
          onError={(message) => showAlert('UPLOAD FAILED', message)}
        />
      )}

      {dialog && (
        <AdminDialog {...dialog} onCancel={closeDialog} />
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
      <Link to="/" className="mt-8 font-mono text-[10px] tracking-[0.3em] text-bone/40 hover:text-bone">
        ← BACK TO SITE
      </Link>
    </div>
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

const input =
  'mt-1 w-full bg-transparent border border-bone/20 px-3 py-2 font-mono text-xs text-bone focus:border-blood outline-none'
const btn =
  'font-mono text-[10px] tracking-[0.25em] border border-bone/30 px-4 py-2 hover:border-bone transition-colors cursor-pointer'
const btnGhost =
  'font-mono text-[10px] tracking-[0.25em] border border-bone/15 px-4 py-2 text-bone/50 hover:text-bone hover:border-bone/40 transition-colors cursor-pointer'
const btnPrimary =
  'font-mono text-[10px] tracking-[0.25em] border border-blood bg-blood text-ink px-4 py-2 hover:bg-transparent hover:text-blood transition-colors cursor-pointer'
