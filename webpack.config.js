const path = require('path')

module.exports = {
  entry: './src/index.ts',
  target: 'node',
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
    library: 'firebase',
    libraryTarget: 'commonjs2'
  }
};
