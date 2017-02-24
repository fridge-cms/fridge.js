import express from 'express'
import LRUCache from 'lru-cache'
import { join } from 'path'
import route from 'next-route'

const dev = process.env.NODE_ENV !== 'production'

const ssrCache = new LRUCache({
  max: 10000,
  maxAge: 0 // never expires
})

const getCacheKey = req => `${req.url}`

const configPath = join(process.cwd(), 'next.config.js')

export default (app) => {
  const userConfig = require(configPath) || {}
  const handle = route(app, userConfig.routes)
  const server = express()

  const renderAndCache = (req, res) => {
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
