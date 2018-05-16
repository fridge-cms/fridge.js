import next from 'next'
import { sendHTML } from 'next/dist/server/render'
import { isInternalUrl } from 'next/dist/server/utils'
import LRUCache from 'lru-cache'
import getConfig from './config'

const dev = process.env.NODE_ENV !== 'production'

const ssrCache = new LRUCache({maxAge: 0}) // never expires

const getCacheKey = req => `${req.url}`

const blockedPages = {
  '/_document': true,
  '/_app': true,
  '/_error': true
}

const fridge = () => {
  const conf = getConfig(process.cwd())
  const app = next({dev, conf})

  const renderWithCache = async (req, res, pathname, query, parsedUrl) => {
    if (isInternalUrl(req.url)) {
      return app.handleRequest(req, res, parsedUrl)
    }

    if (blockedPages[pathname]) {
      return await app.render404(req, res, parsedUrl)
    }

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

  app.render = dev ? app.render.bind(app) : renderWithCache

  return app
}

module.exports = fridge
