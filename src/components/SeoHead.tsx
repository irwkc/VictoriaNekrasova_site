import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLocale } from '../context/LocaleProvider'
import { getAlbumCategory } from '../lib/content'

const SITE = 'https://victorianekrasova.ru'
const OG_IMAGE = `${SITE}/og-image.jpg`

function setMeta(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.content = content
}

export default function SeoHead() {
  const { t, locale, albumLabel } = useLocale()
  const { pathname } = useLocation()

  useEffect(() => {
    let title = t.seo.title
    let description = t.seo.description

    const albumMatch = pathname.match(/^\/portfolio\/([^/]+)/)
    if (albumMatch?.[1]) {
      const cat = getAlbumCategory(albumMatch[1])
      if (cat) {
        const label = albumLabel(cat.id)
        title = `${label} — ${t.seo.title}`
        description = `${label}. ${t.seo.description}`
      }
    }

    document.title = title
    setMeta('description', description)
    setMeta('og:title', title, true)
    setMeta('og:description', description, true)
    setMeta('og:url', `${SITE}${pathname === '/' ? '/' : pathname}`, true)
    setMeta('og:locale', t.seo.ogLocale, true)
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
  }, [t, locale, pathname, albumLabel])

  return null
}

export { SITE, OG_IMAGE }
