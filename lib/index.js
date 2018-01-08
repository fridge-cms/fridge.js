import next from 'next'
import LRUCache from 'lru-cache'
import generateETag from 'etag'
import fresh from 'fresh'
import getConfig from './config'
import Resolve from 'next-route/resolve'

const dev = process.env.NODE_ENV !== 'production'

const ssrCache = new LRUCache({maxAge: 0}) // never expires

const getCacheKey = req => `${req.url}`

const sendHTML = (req, res, html, method, { dev }) => {
  if (res.finished) return
  const etag = generateETag(html)

  if (fresh(req.headers, { etag })) {
    res.statusCode = 304
    res.end()
    return
  }

  if (dev) {
    // In dev, we should not cache pages for any reason.
    // That's why we do this.
    res.setHeader('Cache-Control', 'no-store, must-revalidate')
  }

  res.setHeader('ETag', etag)
  if (!res.getHeader('Content-Type')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
  }
  res.setHeader('Content-Length', Buffer.byteLength(html))
  res.end(method === 'HEAD' ? null : html)
}

const fridge = () => {
  const conf = getConfig(process.cwd())
  const app = next({dev, conf})
  const resolveRoute = Resolve(conf.routes || {})

  const renderWithCache = async (req, res, pathname, query) => {
    const useCache = req.accepts('html') && !dev
    const key = getCacheKey(req)

    try {
      let html = useCache && ssrCache.has(key) ? ssrCache.get(key) : null

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
    // if app is in "static" mode, try to render a file
    // TODO

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
