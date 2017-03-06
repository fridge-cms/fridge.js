import express from 'express'
import LRUCache from 'lru-cache'
import { join } from 'path'
import { parse } from 'url'
import Resolve from 'next-route/resolve'

const dev = process.env.NODE_ENV !== 'production'

const ssrCache = new LRUCache({
  max: 10000,
  maxAge: 0 // never expires
})

const getCacheKey = req => `${req.url}`

const configPath = join(process.cwd(), 'next.config.js')

const nextPaths = ['/_next', '/_webpack', '/__webpack_hmr', '/static/']

const fridge = (app) => {
  const userConfig = require(configPath) || {}
  const handle = app.getRequestHandler()
  const server = express()
  const resolveRoute = Resolve(userConfig.routes || {})

  const renderAndCache = (req, res, {pathname, query}) => {
    const key = getCacheKey(req)

    if (ssrCache.has(key)) {
      res.send(ssrCache.get(key))
      return
    }

    app.renderToHTML(req, res, pathname, query)
      .then(html => {
        ssrCache.set(key, html)
        res.send(html)
      })
      .catch(err => {
        app.renderError(err, req, res, pathname, query)
      })
  }

  server.post('/_update', (req, res) => {
    ssrCache.reset()
    res.sendStatus(200)
  })

  server.get('*', (req, res) => {
    // skip next.js routes
    if (nextPaths.some(path => req.url.startsWith(path))) return handle(req, res)
    // skip files
    if (req.path.indexOf('.') > -1) return handle(req, res)

    // match with custom routes
    const routed = resolveRoute(req.url)
    const parsedUrl = routed || parse(req.url, true)

    // only cache pages
    if (req.accepts('html') && !dev) {
      renderAndCache(req, res, parsedUrl)
    } else {
      return handle(req, res, parsedUrl)
    }
  })

  return server
}

module.exports = fridge
