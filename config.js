const { DefinePlugin } = require("webpack");
const Fridge = require("fridge");

module.exports = (nextConfig = {}) => {
  if (!nextConfig.fridge) {
    throw new Error(
      "> No Fridge configuration found. Please add it to `next.config.js`"
    );
  }

  const { token } = nextConfig.fridge;

  process.env.FRIDGE_TOKEN = token;

  if (typeof nextConfig.exportPathMap === "function") {
    const fridge = new Fridge({ token: process.env.FRIDGE_TOKEN });
    const exportFn = nextConfig.exportPathMap;
    nextConfig.exportPathMap = defaultPathMap =>
      exportFn(fridge, defaultPathMap);
  }

  return {
    ...nextConfig,
    webpack(config, options) {
      config.plugins.push(
        new DefinePlugin({
          "process.env.FRIDGE_TOKEN": JSON.stringify(process.env.FRIDGE_TOKEN)
        })
      );

      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, options);
      }

      return config;
    }
  };
};
