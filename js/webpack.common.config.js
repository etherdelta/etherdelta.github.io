const path = require('path')

module.exports = {
  entry: './js/main.js',
  output: {
    filename: 'main-bundle.js',
    path: path.resolve(__dirname, 'js')
  },
  resolve: {
    modules: [
      "node_modules",
      path.resolve(__dirname, "unpacked_modules")
    ]
  },
  target: "web",
  node: {
    fs: 'empty',
  }
};
