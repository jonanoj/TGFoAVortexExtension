const webpack = require("vortex-api/bin/webpack").default;

const config = webpack("tgfoa-bepinex", __dirname, 5);

// Remove source maps from output
config.devtool = false;
if (config.output && config.output.sourceMapFilename) {
  delete config.output.sourceMapFilename;
}

module.exports = config;
