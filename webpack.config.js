// let prod = process.argv.indexOf('-p') >= 0;
let webpack = require('webpack');

module.exports = {
  devServer: {
    hot: false,
    inline: false,
  },
  entry: {
    app: './src/main.tsx',
    // vendor: [
    //   'matter-js',
    //   'three',
    // ],
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
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'vendor', filename: 'vendor.js',
    // }),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
};

// if (prod) {
//   module.exports.resolve.alias.three = 'three/build/three.min.js';
// }
