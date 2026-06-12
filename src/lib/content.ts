export type GalleryItem = {
  src: string
  cap: string
  span: string
}

export type SiteContent = {
  corridor: string[]
  gallery: GalleryItem[]
}

export const PHOTO_LIBRARY = [
  '/photos/chains1.jpg',
  '/photos/chains2.jpg',
  '/photos/chains3.jpg',
  '/photos/chains4.jpg',
  '/photos/coat1.jpg',
  '/photos/coat2.jpg',
  '/photos/coat3.jpg',
  '/photos/coat4.jpg',
  '/photos/crop1.jpg',
  '/photos/crop2.jpg',
  '/photos/crop3.jpg',
  '/photos/crop4.jpg',
  '/photos/crop5.jpg',
  '/photos/dapple1.jpg',
  '/photos/dapple2.jpg',
  '/photos/red1.jpg',
  '/photos/red2.jpg',
  '/photos/red3.jpg',
  '/photos/red4.jpg',
  '/photos/red5.jpg',
  '/photos/sheer1.jpg',
  '/photos/sheer2.jpg',
  '/photos/sheer3.jpg',
  '/photos/sheer4.jpg',
  '/photos/suit1.jpg',
  '/photos/suit2.jpg',
  '/photos/suit3.jpg',
  '/photos/suit4.jpg',
  '/photos/suit5.jpg',
  '/photos/suit6.jpg',
  '/photos/suit7.jpg',
  '/photos/tux1.jpg',
  '/photos/tux2.jpg',
  '/photos/tux3.jpg',
  '/photos/tux4.jpg',
  '/photos/tux5.jpg',
  '/photos/tux6.jpg',
] as const

export const GALLERY_SPANS = [
  'md:col-span-3',
  'md:col-span-4',
  'md:col-span-5',
  'md:col-span-4 md:row-span-2',
  'md:col-span-5 md:row-span-2',
  'md:col-span-6 md:row-span-2',
] as const

const STORAGE_KEY = 'vn-site-content'

export const DEFAULT_CONTENT: SiteContent = {
  corridor: [
    '/photos/dapple2.jpg',
    '/photos/sheer2.jpg',
    '/photos/chains1.jpg',
    '/photos/red1.jpg',
    '/photos/suit2.jpg',
    '/photos/tux1.jpg',
    '/photos/coat1.jpg',
    '/photos/crop1.jpg',
    '/photos/suit5.jpg',
    '/photos/chains3.jpg',
    '/photos/red3.jpg',
    '/photos/sheer4.jpg',
  ],
  gallery: [
    { src: '/photos/chains2.jpg', cap: 'MOB JOURNAL — VOL.13', span: 'md:col-span-5 md:row-span-2' },
    { src: '/photos/suit1.jpg', cap: 'TAILORING STUDY — B/W', span: 'md:col-span-4' },
    { src: '/photos/red2.jpg', cap: 'BLAZER / RED ROOM', span: 'md:col-span-3' },
    { src: '/photos/sheer1.jpg', cap: 'PARK BY OSIPCHUK', span: 'md:col-span-3' },
    { src: '/photos/tux3.jpg', cap: 'LE SMOKING — 35MM', span: 'md:col-span-4' },
    { src: '/photos/coat2.jpg', cap: 'RAINCOAT — STUDIO', span: 'md:col-span-4 md:row-span-2' },
    { src: '/photos/crop3.jpg', cap: 'DENIM / OFF-DUTY', span: 'md:col-span-4' },
    { src: '/photos/chains4.jpg', cap: 'GOLD CHAINS — DETAIL', span: 'md:col-span-4' },
    { src: '/photos/sheer3.jpg', cap: 'MESH — RED LIP', span: 'md:col-span-4' },
  ],
}

function fromStorage(): SiteContent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SiteContent
  } catch {
    return null
  }
}

export async function loadContent(): Promise<SiteContent> {
  const local = fromStorage()
  if (local) return local

  try {
    const res = await fetch('/content.json')
    if (res.ok) {
      const json = (await res.json()) as SiteContent
      return {
        corridor: json.corridor ?? DEFAULT_CONTENT.corridor,
        gallery: json.gallery ?? DEFAULT_CONTENT.gallery,
      }
    }
  } catch {
    /* offline / static */
  }
  return DEFAULT_CONTENT
}

export async function saveContent(data: SiteContent): Promise<void> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  window.dispatchEvent(new Event('vn-content-updated'))

  try {
    await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data, null, 2),
    })
  } catch {
    /* no dev server API */
  }
}

export function resetContent(): void {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event('vn-content-updated'))
}

export function downloadContent(data: SiteContent) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'content.json'
  a.click()
  URL.revokeObjectURL(url)
}

export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'admin'

export async function fetchPhotoLibrary(): Promise<string[]> {
  try {
    const res = await fetch('/api/photos')
    if (res.ok) {
      const list = (await res.json()) as string[]
      if (list.length) return list
    }
  } catch {
    /* static host */
  }
  return [...PHOTO_LIBRARY]
}

export async function uploadPhoto(file: File): Promise<string> {
  const buf = new Uint8Array(await file.arrayBuffer())
  let binary = ''
  for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]!)
  const data = btoa(binary)

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: file.name, data }),
  })
  if (!res.ok) throw new Error('upload failed')
  const { url } = (await res.json()) as { url: string }
  return url
}
