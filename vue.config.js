const { defineConfig } = require('@vue/cli-service')
const path = require('path') // 引入path模块
function resolve(dir) {
  return path.join(__dirname, dir) // path.join(__dirname)设置绝对路径
}

module.exports = defineConfig({
  transpileDependencies: true,
  outputDir: 'static',
  // publicPath: '/wbbc-explorer/',
  configureWebpack: (config) => {
    return {
      resolve: {
        fallback: {
          "stream": false,
          "assert": false
        }
      },
      // 如果不是生产环境，启用 source map
      // devtool: process.env.NODE_ENV !== 'production' ? 'source-map' : false
    };
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://116.205.160.112:5002',
        secure: false,
        changeOrigin: true
      }
    },
    host: '127.0.0.1',
    allowedHosts: 'all',
    port: 3000
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('Components', resolve('.src/components'))
      .set('Assets', resolve('src/assets'))
      .set('Api', resolve('./src/apis'))
      .set('Utils', resolve('./src/utils'))
      .set('Mixin', resolve('./src/mixin'))
      .set('Store', resolve('./src/store'))
  }
})
