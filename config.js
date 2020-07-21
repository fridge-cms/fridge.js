const { DefinePlugin } = require("webpack");

module.exports = (nextConfig = {}) => {
  if (!nextConfig.fridge) {
    throw new Error(
      "> No Fridge configuration found. Please add it to `next.config.js`"
    );
  }

  const { token } = nextConfig.fridge;

  process.env.FRIDGE_TOKEN = token;

  return {
    ...nextConfig,
    webpack(config, options) {
      config.plugins.push(
        new DefinePlugin({
          "process.env.FRIDGE_TOKEN": JSON.stringify(process.env.FRIDGE_TOKEN),
        })
      );

      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  };
};
