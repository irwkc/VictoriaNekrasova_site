import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const SKIP_PHOTOS = new Set(['face_cut.png', 'seq_bg.jpg'])

function siteApi(): Plugin {
  return {
    name: 'site-api',
    configureServer(server) {
      const root = server.config.root
      const photosDir = () => path.resolve(root, 'public/photos')
      const contentFile = () => path.resolve(root, 'public/content.json')

      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0]

        if (url === '/api/photos' && req.method === 'GET') {
          try {
            const files = fs
              .readdirSync(photosDir())
              .filter((f) => /\.(jpe?g|png|webp)$/i.test(f) && !SKIP_PHOTOS.has(f))
              .sort()
              .map((f) => `/photos/${f}`)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(files))
          } catch {
            res.statusCode = 500
            res.end('[]')
          }
          return
        }

        if (url === '/api/upload' && req.method === 'POST') {
          const chunks: Buffer[] = []
          req.on('data', (c) => chunks.push(c))
          req.on('end', () => {
            try {
              const { name, data } = JSON.parse(Buffer.concat(chunks).toString()) as {
                name: string
                data: string
              }
              const ext = path.extname(name).toLowerCase() || '.jpg'
              const safe = `upload-${Date.now()}${ext.replace(/[^a-z0-9.]/gi, '')}`
              const filePath = path.join(photosDir(), safe)
              fs.writeFileSync(filePath, Buffer.from(data, 'base64'))
              spawnSync('python3', [path.resolve(root, 'scripts/trim-photos.py'), filePath], {
                stdio: 'ignore',
              })
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ url: `/photos/${safe}` }))
            } catch {
              res.statusCode = 400
              res.end('bad upload')
            }
          })
          return
        }

        if (url === '/api/content') {
          const file = contentFile()
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json')
            fs.createReadStream(file).pipe(res)
            return
          }
          if (req.method === 'POST') {
            const chunks: Buffer[] = []
            req.on('data', (c) => chunks.push(c))
            req.on('end', () => {
              try {
                const body = JSON.parse(Buffer.concat(chunks).toString())
                fs.writeFileSync(file, JSON.stringify(body, null, 2) + '\n')
                res.statusCode = 200
                res.end('ok')
              } catch {
                res.statusCode = 400
                res.end('invalid json')
              }
            })
            return
          }
        }

        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), siteApi()],
})
