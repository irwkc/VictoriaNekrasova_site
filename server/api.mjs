import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { attemptLogin, authConfigured, clientIp, getBearerToken, isAuthorized, isIpLocked, lockRemainingMs } from './auth.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const ALBUM_IDS = ['tests', 'photoshoots', 'shows', 'backstage', 'clips']

export const ALBUM_LABELS = {
  tests: 'ТЕСТЫ',
  photoshoots: 'ФОТОСЕССИИ',
  shows: 'ШОУ',
  backstage: 'БЕКСТЕЙДЖ',
  clips: 'КЛИПЫ',
}

const SKIP_PHOTOS = new Set(['face_cut.png', 'seq_bg.jpg'])
const IMAGE_RE = /\.(jpe?g|png|webp)$/i
const CLIP_RE = /\.(mp4|webm|mov)$/i

export function siteRoot(rootOverride) {
  return rootOverride ?? path.resolve(__dirname, '..')
}

export function paths(root) {
  const base = siteRoot(root)
  const publicDir = fs.existsSync(path.join(base, 'public')) ? path.join(base, 'public') : base
  const trimScript =
    process.env.TRIM_SCRIPT ||
    (fs.existsSync(path.join(base, 'scripts/trim-photos.py'))
      ? path.join(base, 'scripts/trim-photos.py')
      : '/opt/vn-server/scripts/trim-photos.py')
  return {
    root: base,
    photosDir: path.join(publicDir, 'photos'),
    albumsDir: path.join(publicDir, 'photos/albums'),
    contentFile: path.join(publicDir, 'content.json'),
    trimScript,
  }
}


export { isAuthorized, getBearerToken }

function ensureAlbumDirs(p) {
  for (const id of ALBUM_IDS) {
    const dir = path.join(p.albumsDir, id)
    fs.mkdirSync(dir, { recursive: true })
  }
}

function listDirMedia(dir, urlPrefix) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => IMAGE_RE.test(f) || CLIP_RE.test(f))
    .sort()
    .map((f) => `${urlPrefix}/${f}`)
}

export function listLibraryPhotos(root) {
  const p = paths(root)
  return listDirMedia(p.photosDir, '/photos').filter((url) => {
    const name = path.basename(url)
    return !SKIP_PHOTOS.has(name) && !url.includes('/albums/')
  })
}

export function listAlbumFiles(root, albumId) {
  if (!ALBUM_IDS.includes(albumId)) return []
  const p = paths(root)
  ensureAlbumDirs(p)
  return listDirMedia(path.join(p.albumsDir, albumId), `/photos/albums/${albumId}`)
}

function trimImage(filePath, trimScript) {
  if (!IMAGE_RE.test(filePath)) return
  spawnSync('python3', [trimScript, filePath], { stdio: 'ignore' })
}

export function readContent(root) {
  const p = paths(root)
  return JSON.parse(fs.readFileSync(p.contentFile, 'utf8'))
}

export function writeContent(root, data) {
  const p = paths(root)
  fs.writeFileSync(p.contentFile, JSON.stringify(data, null, 2) + '\n')
}

export function handleApi(req, res, body, rootOverride) {
  const p = paths(rootOverride)
  ensureAlbumDirs(p)

  const url = (req.url || '').split('?')[0]
  const params = new URL(req.url || '', 'http://local')
  const method = req.method || 'GET'

  const json = (code, data) => {
    res.statusCode = code
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data))
  }

  const unauthorized = () => json(401, { error: 'unauthorized' })

  try {
    if (url === '/api/admin/session' && method === 'GET') {
      if (!authConfigured()) return json(503, { error: 'misconfigured' })
      if (!isAuthorized(req)) return unauthorized()
      return json(200, { ok: true })
    }

    if (url === '/api/admin/login' && method === 'POST') {
      if (!authConfigured()) return json(503, { error: 'misconfigured' })
      const ip = clientIp(req)
      if (isIpLocked(ip)) {
        return json(429, {
          error: 'locked',
          remainingMs: lockRemainingMs(ip),
        })
      }
      const { username, password } = JSON.parse(body)
      const result = attemptLogin(req, username, password)
      if (result.ok) return json(200, { token: result.token })
      if (result.locked) {
        return json(429, { error: 'locked', remainingMs: result.remainingMs })
      }
      return json(401, { error: 'invalid', attemptsLeft: result.attemptsLeft })
    }

    if (url === '/api/photos' && method === 'GET') {
      const album = params.searchParams.get('album')
      if (album) return json(200, listAlbumFiles(rootOverride, album))
      return json(200, listLibraryPhotos(rootOverride))
    }

    if (url === '/api/upload' && method === 'POST') {
      if (!isAuthorized(req)) return unauthorized()
      const { name, data, album } = JSON.parse(body)
      const ext = path.extname(name).toLowerCase() || '.jpg'
      const isClip = album === 'clips'
      if (isClip && !CLIP_RE.test(name)) return json(400, { error: 'clips require video' })
      if (!isClip && album && !IMAGE_RE.test(name)) return json(400, { error: 'invalid image' })

      const safeName = `${Date.now()}${ext.replace(/[^a-z0-9.]/gi, '')}`
      let filePath
      let urlPath
      if (album && ALBUM_IDS.includes(album)) {
        filePath = path.join(p.albumsDir, album, safeName)
        urlPath = `/photos/albums/${album}/${safeName}`
      } else {
        filePath = path.join(p.photosDir, `upload-${safeName}`)
        urlPath = `/photos/upload-${safeName}`
      }

      fs.writeFileSync(filePath, Buffer.from(data, 'base64'))
      trimImage(filePath, p.trimScript)
      return json(200, { url: urlPath })
    }

    if (url === '/api/delete' && method === 'POST') {
      if (!isAuthorized(req)) return unauthorized()
      const { url: fileUrl } = JSON.parse(body)
      if (!fileUrl || !fileUrl.startsWith('/photos/')) return json(400, { error: 'bad url' })
      const rel = fileUrl.replace(/^\/photos\/?/, '')
      const filePath = path.join(p.photosDir, rel)
      if (!filePath.startsWith(p.photosDir)) return json(400, { error: 'bad path' })
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
      return json(200, { ok: true })
    }

    if (url === '/api/content') {
      if (method === 'GET') {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        fs.createReadStream(p.contentFile).pipe(res)
        return
      }
      if (method === 'POST') {
        if (!isAuthorized(req)) return unauthorized()
        const parsed = JSON.parse(body)
        writeContent(rootOverride, parsed)
        return json(200, { ok: true })
      }
    }

    json(404, { error: 'not found' })
  } catch {
    json(400, { error: 'bad request' })
  }
}
