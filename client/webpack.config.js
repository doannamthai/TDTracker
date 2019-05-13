var webpack = require('webpack');

module.exports = {
  resolve: {
    alias: {
      '@': require('path').resolve(__dirname, 'src'), // eslint-disable-line
    },
  },
  plugins: [ 
    new webpack.IgnorePlugin(new RegExp("^(fs|ipc)$"))
  ],
  target: 'electron-renderer',
};
