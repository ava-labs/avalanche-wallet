module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  devServer: {
    https: true
  },
  configureWebpack:{
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 200000,
      }
    }
  },
  pwa: {
    manifestOptions: {
      start_url: '/'
    },
    iconPaths: {
      favicon16: 'favicon.ico',
      favicon32: 'favicon.ico'
    }
  }
};