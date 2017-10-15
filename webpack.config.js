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
      'csstips',
      // 'preact',
      // 'preact-compat',
      'react',
      'react-dom',
      // The full thing is huge, and piecemeal listing is trouble, so just let
      // icons go with app.
      // 'react-feather',
      'typestyle',
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
    new webpack.DefinePlugin({'process.env': {NODE_ENV: '"production"'}}),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor', filename: 'vendor.js',
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
  resolve: {
    // alias: {
    //   'react': 'preact-compat',
    //   'react-dom': 'preact-compat',
    // },
    extensions: ['.js', '.ts', '.tsx'],
  },
};
