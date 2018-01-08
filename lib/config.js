const { DefinePlugin } = require('webpack')
const findUp = require('find-up')
const Fridge = require('fridge')

const cache = new Map()

const defaultConfig = {
  poweredByHeader: true,
  distDir: '.next',
  assetPrefix: '',
  useFileSystemPublicRoutes: false
}

module.exports = (dir) => {
  if (!cache.has(dir)) {
    cache.set(dir, loadConfig(dir))
  }

  return cache.get(dir)
}

const loadConfig = (dir) => {
  const path = findUp.sync(['next.config.js', 'fridge.config.js'], {
    cwd: dir
  })

  if (!path) {
    throw new Error('')
  }

  const userConfig = require(path)

  if (!userConfig.fridge) {
    throw new Error('> No Fridge configuration found. Please add it to `next.config.js`')
  }

  const {client_id, public_id, client_secret} = userConfig.fridge

  process.env.FRIDGE_ID = client_id || public_id // eslint-disable-line
  process.env.FRIDGE_SECRET = client_secret || '' // eslint-disable-line

  if (typeof userConfig.exportPathMap === 'function') {
    const fridge = new Fridge({
      client_id: process.env.FRIDGE_ID,
      client_secret: process.env.FRIDGE_SECRET
    })
    const exportFn = userConfig.exportPathMap
    userConfig.exportPathMap = () => exportFn(fridge)
  }

  return Object.assign({}, defaultConfig, userConfig, {
    webpack: (config, ...args) => {
      if (userConfig.webpack) {
        config = userConfig.webpack(config, ...args)
      }

      config.plugins.push(new DefinePlugin({
        'process.env.FRIDGE_ID': JSON.stringify(public_id || process.env.FRIDGE_ID) // eslint-disable-line
      }))

      return config
    }
  })
}