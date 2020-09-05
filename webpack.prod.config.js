const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')

module.exports = [
  {
    mode: 'production',
    entry: './src/electron.ts',
    target: 'electron-main',
    node: {
      __dirname: true,
    },
    resolve: {
      alias: {
        '7zip-min': __dirname + '/7zip-min/index.js',
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: /src/,
          use: [{ loader: 'ts-loader' }],
        },
      ],
    },
    output: {
      path: __dirname + '/dist',
      filename: 'electron.js',
    },
  },
  {
    mode: 'production',
    entry: './src/react.tsx',
    target: 'electron-renderer',
    devtool: 'source-map',
    node: {
      __dirname: true,
    },
    resolve: {
      extensions: ['.js', '.ts', '.tsx'],
      modules: [path.resolve('./node_modules'), path.resolve('./src/App')],
      alias: {
        '7zip-min': __dirname + '/7zip-min/index.js',
      },
    },
    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          include: /src/,
          use: [{ loader: 'ts-loader' }],
        },
      ],
    },
    output: {
      path: __dirname + '/dist',
      filename: 'react.js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
      }),
      new CopyWebpackPlugin({
        patterns: [{ from: 'src/App/assets/images', to: 'images' }],
      }),
    ],
  },
]
