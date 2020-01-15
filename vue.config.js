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
  }
};