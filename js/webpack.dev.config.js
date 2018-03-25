const path = require('path')
const merge = require('webpack-merge')
const common = require('./webpack.common.config.js')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './'
  }
})
