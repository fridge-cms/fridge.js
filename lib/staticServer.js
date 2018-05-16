import { resolve } from 'path'
import getConfig from './config'
import buildApp from 'next/dist/server/build'
import exportApp from 'next/dist/server/export'
import server from 'serve/lib/server'

module.exports = () => {
  const dir = resolve(process.cwd() || '.')
  const conf = getConfig(dir)

  process.env.ASSET_DIR = '/' + Math.random().toString(36).substr(2, 10)

  // POST /_update
  // GET /:path*
  app.router.add('POST', '/_update', async (req, res) => {
    try {
      await buildApp(dir, conf)
      await exportApp(dir, {outdir: `${dir}/out`}, conf)
      res.statusCode = 200
      res.end('')
    } catch (err) {
      console.error(err)
      res.statusCode = 500
      res.end('')
    }
  })

  app.router.add('GET', '/:path*', (req, res) => {
    return server(req, res, {}, `${dir}/out`, [])
  })
}
