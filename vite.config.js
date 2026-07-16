import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ─────────────────────────────────────────────────────────────────────────────
// Local API dev middleware
//
// `npm run dev` runs the plain Vite dev server, which only serves the
// frontend — it does NOT execute the /api/*.js serverless functions the way
// Vercel does in production. Without this plugin, every fetch('/api/...')
// call during local development gets Vite's HTML fallback instead of JSON,
// which is why questions (and AI feedback) fail to load locally.
//
// This plugin intercepts /api/* requests during `vite dev` only, dynamically
// loads the matching function from api/<path>.js, and calls it with the same
// req/res shape Vercel provides (req.query, req.body, res.status().json()).
// It has no effect on `vite build` / production — Vercel's own runtime
// handles /api/* there, completely unchanged.
// ─────────────────────────────────────────────────────────────────────────────
function apiDevMiddleware() {
  return {
    name: 'englishace-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next()

        const urlObj = new URL(req.url, 'http://localhost')
        const routePath = urlObj.pathname.replace(/^\/api\//, '')

        // Mirror Vercel's real convention: any path segment starting with "_"
        // (e.g. api/_lib/**) is a shared/internal module, never a routable
        // function, on both Vercel and here in local dev.
        const isUnderscored = routePath.split('/').some(seg => seg.startsWith('_'))
        if (!routePath || isUnderscored || routePath.includes('..')) {
          res.statusCode = 404
          res.end('Not found')
          return
        }

        let handlerModule
        try {
          handlerModule = await server.ssrLoadModule(`/api/${routePath}.js`)
        } catch (err) {
          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: `No API route at /api/${routePath}` }))
          return
        }

        const handler = handlerModule.default
        if (typeof handler !== 'function') {
          res.statusCode = 404
          res.end('Not found')
          return
        }

        // Shim the Vercel-style req/res API on top of Vite's raw Node req/res
        req.query = Object.fromEntries(urlObj.searchParams)

        res.status = (code) => { res.statusCode = code; return res }
        res.json = (data) => {
          if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
        }

        // Respect each function's own bodyParser setting, exactly like Vercel:
        // - default (unset/true): parse JSON body onto req.body
        // - explicit false (e.g. transcribe.js): leave the raw stream alone
        const wantsRawBody = handlerModule.config?.api?.bodyParser === false

        try {
          if (!wantsRawBody && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
            const chunks = []
            for await (const chunk of req) chunks.push(chunk)
            const raw = Buffer.concat(chunks).toString('utf-8')
            try { req.body = raw ? JSON.parse(raw) : {} } catch { req.body = {} }
          }

          await handler(req, res)
        } catch (err) {
          console.error(`[api-dev] /api/${routePath} error:`, err)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Local dev server error', detail: err.message }))
          }
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), apiDevMiddleware()],
})
