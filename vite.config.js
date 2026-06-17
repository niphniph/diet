import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const dietBaseRedirect = () => ({
  name: 'diet-base-redirect',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/diet' || req.url?.startsWith('/diet?')) {
        res.statusCode = 302
        res.setHeader('Location', req.url.replace('/diet', '/diet/'))
        res.end()
        return
      }
      next()
    })
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/diet' || req.url?.startsWith('/diet?')) {
        res.statusCode = 302
        res.setHeader('Location', req.url.replace('/diet', '/diet/'))
        res.end()
        return
      }
      next()
    })
  },
})

export default defineConfig({
  plugins: [react(), dietBaseRedirect()],
  base: '/diet/',
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
})
