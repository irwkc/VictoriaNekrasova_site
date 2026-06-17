import http from 'node:http'
import { handleApi, siteRoot } from './api.mjs'

const PORT = Number(process.env.PORT || 8787)
const ROOT = siteRoot(process.env.SITE_ROOT)

const server = http.createServer((req, res) => {
  if (!(req.url || '').startsWith('/api/')) {
    res.statusCode = 404
    res.end('not found')
    return
  }

  if (req.method === 'GET') {
    handleApi(req, res, '', ROOT)
    return
  }

  const chunks = []
  req.on('data', (c) => chunks.push(c))
  req.on('end', () => handleApi(req, res, Buffer.concat(chunks).toString(), ROOT))
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`VN API listening on 127.0.0.1:${PORT}`)
})
