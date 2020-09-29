const fs = require("fs");
const path = require("path");
const babelLoader = require("craco-babel-loader");

const workspace = fs.realpathSync(process.cwd());
const resolve = (relativePath) => path.resolve(workspace, relativePath);

module.exports = {
  plugins: [
    {
      plugin: babelLoader,
      options: {
        includes: [resolve("../shared")],
        excludes: [/(node_modules|bower_components)/],
      },
    },
  ],
};
