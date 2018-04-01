const webpack = require('webpack')
const merge = require('webpack-merge')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const common = require('./webpack.common.config.js')

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimize: false // <- Turns of Uglify so we can customize how it works. If we don't then the trade operations start failing.
  },
  plugins: [
    new UglifyJSPlugin({
      sourceMap: true,
      uglifyOptions: {
        warnings: true,
        compress: false,
        mangle: false,
        output: {
          beautify: true
        },
        keep_classnames: true,
        keep_fnames: true
      },
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
})
