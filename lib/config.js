const { DefinePlugin } = require('webpack')
const findUp = require('find-up')
const Fridge = require('fridge')

const cache = new Map()

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

  const {token} = userConfig.fridge

  process.env.FRIDGE_TOKEN = token

  if (typeof userConfig.exportPathMap === 'function') {
    const fridge = new Fridge({token: process.env.FRIDGE_TOKEN})
    const exportFn = userConfig.exportPathMap
    userConfig.exportPathMap = (defaultPathMap) => exportFn(fridge, defaultPathMap)
  }

  return Object.assign({}, userConfig, {
    webpack: (config, ...args) => {
      if (userConfig.webpack) {
        config = userConfig.webpack(config, ...args)
      }

      config.plugins.push(new DefinePlugin({
        'process.env.FRIDGE_TOKEN': JSON.stringify(process.env.FRIDGE_TOKEN)
      }))

      return config
    }
  })
}
