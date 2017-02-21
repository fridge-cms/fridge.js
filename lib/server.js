import express from 'express'
import next from 'next'
import LRUCache from 'lru-cache'
import { DefinePlugin } from 'webpack'

const dev = process.env.NODE_ENV !== 'production'
const app = next({dev})
const handle = app.getRequestHandler()

const ssrCache = new LRUCache({
  max: 10000,
  maxAge: 0 // never expires
})

const getCacheKey = req => `${req.url}`

function renderAndCache (req, res) {
  const key = getCacheKey(req)

  if (ssrCache.has(key)) {
    res.send(ssrCache.get(key))
    return
  }

  app.renderToHTML(req, res, req.path, req.query)
    .then(html => {
      ssrCache.set(key, html)
      res.send(html)
    })
    .catch(err => {
      app.renderError(err, req, res, req.path, req.query)
    })
}

export default class Server {
  constructor (opts) {
    // pathsToExport
    // this.loadConfig(opts)
  }

  async prepare () {
    await app.prepare()
  }

  async start (port = 3000, hostname) {
    await this.prepare()
    const router = this.defineRoutes()

    router.listen(port, err => {
      if (err) throw err
      if (!process.env.NOW) {
        console.log(`> Ready on http://localhost:${port}`)
      }
    })
  }

  defineRoutes () {
    const server = express()

    server.post('/_update', (req, res) => {
      ssrCache.reset()
      res.sendStatus(200)
    })

    server.get('*', (req, res) => {
      // only cache pages
      if (req.accepts('html') && req.path.indexOf('.') === -1 && !dev) {
        renderAndCache(req, res)
      } else {
        return handle(req, res)
      }
    })

    return server
  }
}
