const rules = require('./webpack.rules');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json']
  },
};
