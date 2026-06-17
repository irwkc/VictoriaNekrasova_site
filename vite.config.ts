import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// @ts-expect-error node api module
import { handleApi } from './server/api.mjs'

function siteApi(): Plugin {
  return {
    name: 'site-api',
    configureServer(server) {
      const root = server.config.root

      server.middlewares.use((req, res, next) => {
        if (!(req.url || '').startsWith('/api/')) return next()

        if (req.method === 'GET') {
          handleApi(req, res, '', root)
          return
        }

        const chunks: Buffer[] = []
        req.on('data', (c) => chunks.push(c))
        req.on('end', () => handleApi(req, res, Buffer.concat(chunks).toString(), root))
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), siteApi()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('@react-three')) return 'three'
          if (id.includes('node_modules/motion')) return 'motion'
          if (id.includes('node_modules/lenis')) return 'lenis'
          if (id.includes('node_modules/react-router')) return 'router'
        },
      },
    },
  },
})
