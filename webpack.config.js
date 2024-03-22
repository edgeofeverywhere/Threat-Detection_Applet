const path = require('path');

module.exports = {
  mode: 'development',
  entry: path.join(__dirname, 'app', 'index'),
  watch: true,
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: "bundle.js",
    chunkFilename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'app')
        ],
        exclude: [
          path.resolve(__dirname, 'node_modules')
        ],
        loader: 'babel-loader',
        options: {
          presets: [
            ["@babel/env", {
              "targets": {
                "browsers": "last 2 chrome versions"
              }
            }]
          ]
        },
      },
      {
        test: /\.css$/, // Add this rule for CSS files
        use: ['style-loader', 'css-loader'] // Use style-loader and css-loader
      }
    ]
  },
  resolve: {
    extensions: ['.json', '.js', '.jsx']
  },
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'), // Serve files from the dist directory
    },
    port: 8080,
    hot: "only"
  }
};