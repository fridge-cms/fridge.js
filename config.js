const { DefinePlugin } = require('webpack')

module.exports = (userConfig) => {
  if (!userConfig.fridge) {
    throw new Error('> No Fridge configuration found. Please add it to `next.config.js`')
  }

  const {client_id, public_id, client_secret} = userConfig.fridge

  process.env.FRIDGE_ID = client_id || public_id // eslint-disable-line
  process.env.FRIDGE_SECRET = client_secret // eslint-disable-line

  return {
    webpack: (config, ...args) => {
      if (userConfig.webpack) {
        config = userConfig.webpack(config, ...args)
      }

      config.plugins.push(new DefinePlugin({
        'process.env.FRIDGE_ID': JSON.stringify(public_id || process.env.FRIDGE_ID) // eslint-disable-line
      }))

      return config
    }
  }
}
