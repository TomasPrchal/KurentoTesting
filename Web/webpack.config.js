/// <binding ProjectOpened='Watch - Development' />
var path = require('path');

module.exports = {
  context: path.join(__dirname, 'wwwroot/App'),
  entry: './start.ts',
  output: {
    path: path.join(__dirname, 'wwwroot/js'),
    filename: 'kurentoWrapper.js'
  },
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  },
  devServer: {
    contentBase: ".",
    host: "localhost",
    port: 9000
  },
};