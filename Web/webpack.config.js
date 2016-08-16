/// <binding ProjectOpened='Watch - Development' />
var path = require('path');

module.exports = {
  context: path.join(__dirname, 'wwwroot/App'),
  entry: './start.ts',
  output: {
    path: path.join(__dirname, 'wwwroot/js'),
    filename: 'kurentoWrapper.js'
  },
  devServer: {
    contentBase: ".",
    host: "localhost",
    port: 9000
  },
};