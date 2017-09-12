// let prod = process.argv.indexOf('-p') >= 0;
let webpack = require('webpack');

module.exports = {
  devServer: {
    compress: true,
    hot: false,
    inline: false,
  },
  entry: {
    app: './src/main.tsx',
    vendor: [
      'preact',
      'preact-compat',
    ],
  },
  module: {
    loaders: [
      {
        test: /\.ts$|\.tsx$/,
        loader: 'awesome-typescript-loader',
      },
    ],
  },
  output: {filename: "app.js"},
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor', filename: 'vendor.js',
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
  resolve: {
    alias: {
      'react': 'preact-compat',
      'react-dom': 'preact-compat',
    },
    extensions: ['.js', '.ts', '.tsx'],
  },
};
