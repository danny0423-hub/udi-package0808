// webpack.config.cjs
const path = require('path');

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';

  return {
    mode: isDev ? 'development' : 'production',
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js',
      library: { type: 'module' }, // 產出 ESM
      module: true,
      environment: { module: true },
      clean: true, // ✅ 每次打包前清空 dist
    },
    experiments: {
      outputModule: true,
    },
    devtool: isDev ? 'source-map' : false, // ✅ dev 才輸出 source map
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    externals: {
      react: 'react',
      'react-dom': 'react-dom',
    },
    optimization: {
      minimize: !isDev, // prod 才壓縮
    },
  };
};
