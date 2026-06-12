import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

function contentApi(): Plugin {
  return {
    name: 'content-api',
    configureServer(server) {
      server.middlewares.use('/api/content', (req, res, next) => {
        const file = path.resolve(server.config.root, 'public/content.json')
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
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), contentApi()],
})
