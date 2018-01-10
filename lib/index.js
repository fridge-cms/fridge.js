import next from 'next'
import { sendHTML } from 'next/dist/server/render'
import LRUCache from 'lru-cache'
import getConfig from './config'
import Resolve from 'next-route/resolve'

const dev = process.env.NODE_ENV !== 'production'

const ssrCache = new LRUCache({maxAge: 0}) // never expires

const getCacheKey = req => `${req.url}`

const fridge = () => {
  const conf = getConfig(process.cwd())
  const app = next({dev, conf})
  const resolveRoute = Resolve(conf.routes || {})

  const renderWithCache = async (req, res, pathname, query) => {
    const key = getCacheKey(req)

    try {
      let html = !dev && ssrCache.has(key) ? ssrCache.get(key) : null

      if (!html) {
        html = await app.renderToHTML(req, res, pathname, query)
        ssrCache.set(key, html)
      }

      return sendHTML(req, res, html, req.method, app.renderOpts)
    } catch (err) {
      app.renderError(err, req, res, pathname, query)
    }
  }

  app.router.add('POST', '/_update', (req, res) => {
    ssrCache.reset()
    res.statusCode = 200
    res.end('')
  })

  app.router.add('GET', '/:path*', async (req, res, params, parsedUrl) => {
    // match with custom routes
    const routed = resolveRoute(req.url)
    if (routed) parsedUrl = routed

    const { pathname, query } = parsedUrl

    // only cache pages in production
    if (!dev) {
      await renderWithCache(req, res, pathname, query)
    } else {
      await app.render(req, res, pathname, query)
    }
  })

  return app
}

module.exports = fridge
