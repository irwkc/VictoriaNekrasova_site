import { useState, type MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLocale } from '../context/LocaleProvider'
import { scrollToHash } from '../lib/smoothScroll'

const IG = 'https://www.instagram.com/victorianekrasovaaa/'

export default function Nav() {
  const { t, locale, setLocale } = useLocale()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const LINKS = [
    { href: '#sequence', label: t.nav.sequence },
    { href: '#editorial', label: t.nav.editorial },
    { href: '#archive', label: t.nav.archive },
    { kind: 'portfolio' as const, label: t.nav.portfolio },
    { href: '#contact', label: t.nav.contact },
  ] as const

  const close = () => setOpen(false)

  const onAnchor = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    close()
    if (location.pathname !== '/') {
      navigate('/' + href)
      return
    }
    scrollToHash(href)
  }

  const onPortfolio = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    close()
    if (location.pathname !== '/') {
      navigate('/#portfolio')
      return
    }
    scrollToHash('#portfolio')
  }

  const linkClass = 'hover:text-bone transition-colors duration-200'

  return (
    <header className="fixed top-0 inset-x-0 z-[80] mix-blend-difference">
      <div className="flex items-center justify-between px-5 md:px-10 py-5">
        <a href="#top" className="font-display text-lg tracking-wide text-bone" onClick={(e) => onAnchor(e, '#top')}>
          VN<span className="text-blood">.</span>
        </a>

        <nav className="hidden md:flex items-center gap-8 font-mono text-[10px] tracking-[0.3em] text-bone/80">
          {LINKS.map((link) =>
            'kind' in link ? (
              <a key={link.label} href="#portfolio" className={linkClass} onClick={onPortfolio}>
                {link.label}
              </a>
            ) : (
              <a key={link.label} href={link.href} className={linkClass} onClick={(e) => onAnchor(e, link.href)}>
                {link.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden sm:flex font-mono text-[9px] tracking-[0.15em] border border-bone/25">
            <button
              type="button"
              onClick={() => setLocale('ru')}
              className={`px-2.5 py-1.5 transition-colors ${locale === 'ru' ? 'bg-bone text-ink' : 'text-bone/60 hover:text-bone'}`}
            >
              RU
            </button>
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`px-2.5 py-1.5 transition-colors ${locale === 'en' ? 'bg-bone text-ink' : 'text-bone/60 hover:text-bone'}`}
            >
              EN
            </button>
          </div>
          <a
            href={IG}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[10px] tracking-[0.3em] border border-bone/40 px-4 py-2 text-bone hover:bg-bone hover:text-ink transition-colors duration-200"
          >
            {t.nav.book}
          </a>
          <button
            type="button"
            className="md:hidden font-mono text-[10px] tracking-[0.2em] text-bone border border-bone/40 px-3 py-2"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '✕' : t.nav.menu}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="md:hidden border-t border-bone/10 bg-ink/95 backdrop-blur px-5 py-4 flex flex-col gap-4 font-mono text-[10px] tracking-[0.3em] text-bone/80"
        >
          {LINKS.map((link) =>
            'kind' in link ? (
              <a key={link.label} href="#portfolio" className={linkClass} onClick={onPortfolio}>
                {link.label}
              </a>
            ) : (
              <a key={link.label} href={link.href} className={linkClass} onClick={(e) => onAnchor(e, link.href)}>
                {link.label}
              </a>
            ),
          )}
          <div className="flex gap-2 pt-2 border-t border-bone/10">
            <button
              type="button"
              onClick={() => setLocale('ru')}
              className={`px-3 py-1.5 border ${locale === 'ru' ? 'border-bone text-bone' : 'border-bone/20 text-bone/50'}`}
            >
              RU
            </button>
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`px-3 py-1.5 border ${locale === 'en' ? 'border-bone text-bone' : 'border-bone/20 text-bone/50'}`}
            >
              EN
            </button>
          </div>
        </nav>
      )}
    </header>
  )
}
