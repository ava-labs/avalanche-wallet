module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  devServer: {
    https: false
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