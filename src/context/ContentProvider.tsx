import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { DEFAULT_CONTENT, loadContent, type SiteContent } from '../lib/content'

type Ctx = {
  content: SiteContent
  refresh: () => Promise<void>
}

const ContentContext = createContext<Ctx>({
  content: DEFAULT_CONTENT,
  refresh: async () => {},
})

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT)

  const refresh = async () => setContent(await loadContent())

  useEffect(() => {
    refresh()
    const onUpdate = () => refresh()
    window.addEventListener('vn-content-updated', onUpdate)
    return () => window.removeEventListener('vn-content-updated', onUpdate)
  }, [])

  return (
    <ContentContext.Provider value={{ content, refresh }}>{children}</ContentContext.Provider>
  )
}

export function useContent() {
  return useContext(ContentContext)
}
