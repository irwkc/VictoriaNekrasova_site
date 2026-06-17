import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { en, type LocaleStrings } from '../i18n/locales/en'
import { ru } from '../i18n/locales/ru'
import type { AlbumId } from '../lib/content'

export type Locale = 'ru' | 'en'

const STORAGE_KEY = 'vn-locale'

type Ctx = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: LocaleStrings
  albumLabel: (id: AlbumId) => string
}

const LocaleContext = createContext<Ctx>({
  locale: 'ru',
  setLocale: () => {},
  t: ru,
  albumLabel: () => '',
})

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'en' ? 'en' : 'ru'
  })

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  const t = locale === 'en' ? en : ru

  const albumLabel = (id: AlbumId) => t.albums[id]

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, albumLabel }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
