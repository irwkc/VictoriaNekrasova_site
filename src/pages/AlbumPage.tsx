import { Link, Navigate, useParams } from 'react-router-dom'
import AlbumGrid from '../components/AlbumGrid'
import Cursor from '../components/Cursor'
import { useContent } from '../context/ContentProvider'
import { ALBUM_CATEGORIES, getAlbumCategory } from '../lib/content'
import { useLocale } from '../context/LocaleProvider'

const IG = 'https://www.instagram.com/victorianekrasovaaa/'

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>()
  const { content } = useContent()
  const { t, albumLabel, locale, setLocale } = useLocale()
  const category = id ? getAlbumCategory(id) : undefined

  if (!category) return <Navigate to="/#portfolio" replace />

  const items = content.albums[category.id] ?? []

  return (
    <div className="grain bg-ink text-bone antialiased min-h-screen">
      <Cursor />
      <header className="sticky top-0 z-[80] border-b border-bone/10 bg-ink/95 backdrop-blur">
        <div className="flex items-center justify-between px-5 md:px-10 py-5">
          <Link to="/" className="font-display text-lg tracking-wide">
            VN<span className="text-blood">.</span>
          </Link>
          <Link
            to="/#portfolio"
            className="font-mono text-[10px] tracking-[0.3em] text-bone/50 hover:text-bone transition-colors"
          >
            {t.albumPage.back}
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex font-mono text-[9px] tracking-[0.15em] border border-bone/25">
              <button
                type="button"
                onClick={() => setLocale('ru')}
                className={`px-2 py-1 transition-colors ${locale === 'ru' ? 'bg-bone text-ink' : 'text-bone/60'}`}
              >
                RU
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`px-2 py-1 transition-colors ${locale === 'en' ? 'bg-bone text-ink' : 'text-bone/60'}`}
              >
                EN
              </button>
            </div>
            <a
            href={IG}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[10px] tracking-[0.3em] border border-bone/40 px-4 py-2 hover:bg-bone hover:text-ink transition-colors"
          >
            {t.nav.book}
          </a>
          </div>
        </div>
      </header>

      <main className="px-5 md:px-10 py-12 md:py-16 max-w-7xl mx-auto">
        <div className="mb-10 md:mb-14">
          <p className="font-mono text-[10px] tracking-[0.35em] text-bone/40 mb-3">
            {t.albumPage.portfolio} / {String(ALBUM_CATEGORIES.indexOf(category) + 1).padStart(2, '0')}
          </p>
          <h1 className="font-display text-[14vw] md:text-[6vw] leading-[0.85]">{albumLabel(category.id)}</h1>
          <p className="mt-4 font-mono text-[10px] tracking-[0.3em] text-bone/45">
            {items.length} {items.length === 1 ? t.albumPage.frame : t.albumPage.frames}
          </p>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-6 mb-8 scrollbar-none">
          {ALBUM_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/portfolio/${cat.id}`}
              className={`shrink-0 font-mono text-[9px] md:text-[10px] tracking-[0.22em] px-3 py-2 border transition-colors ${
                cat.id === category.id
                  ? 'border-blood text-blood bg-blood/10'
                  : 'border-bone/20 text-bone/45 hover:border-bone/50 hover:text-bone'
              }`}
            >
              {albumLabel(cat.id)}
            </Link>
          ))}
        </nav>

        <AlbumGrid items={items} />
      </main>
    </div>
  )
}
