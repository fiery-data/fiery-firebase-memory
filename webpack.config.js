const path = require('path')

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.ts' ]
  },
  output: {
    filename: 'fiery-firebase-memory.js',
    path: path.resolve(__dirname, 'dist'),
    globalObject: 'typeof self !== \'undefined\' ? self : this',
    library: 'firebase',
    libraryTarget: 'umd',
    libraryExport: 'default',
    umdNamedDefine: true
  }
};
