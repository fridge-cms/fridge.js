import next from 'next'
import { sendHTML } from 'next/dist/server/render'
import { isInternalUrl } from 'next/dist/server/utils'
import pathMatch from 'next/dist/server/lib/path-match'
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

const getRoute = (value) => {
  return typeof value === 'string' ? {page: value} : value;
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

  const nextPrepare = app.prepare.bind(app)
  app.prepare = async () => {
    app.render = dev ? app.render.bind(app) : renderWithCache

    // use dynamic routing to handle SSR requests
    if (app.nextConfig.routes) {
      for (const path in app.nextConfig.routes) {
        const {page, query = {}} = getRoute(app.nextConfig.routes[path]);

        for (const method of ['GET', 'HEAD']) {
          app.router.add(method, path, async (req, res, params, parsedUrl) => {
            await app.render(req, res, page, {...params, ...query}, parsedUrl)
          })
        }
      }
    }

    if (!dev && app.nextConfig.exportPathMap && app.nextConfig.useExportRoutes) {
      console.log('Defining routes from exportPathMap')
      const exportPathMap = await app.nextConfig.exportPathMap({})
      for (const path in exportPathMap) {
        const {page, query = {}} = exportPathMap[path]
        for (const method of ['GET', 'HEAD']) {
          app.router.add(method, path, async (req, res, params, parsedUrl) => {
            const { query: urlQuery } = parsedUrl
            await app.render(req, res, page, {...urlQuery, ...query}, parsedUrl)
          })
        }
      }
    }

    app.router.add('POST', '/_update', (req, res) => {
      ssrCache.reset()
      res.statusCode = 200
      res.end('')
    })

    await nextPrepare()
  }

  return app
}

module.exports = fridge
