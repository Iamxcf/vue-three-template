'use strict'
const path = require('path')
const { HashedModuleIdsPlugin } = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin') // 去掉注释
function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = 'vue Template' // page title

const port = process.env.port || process.env.npm_config_port || 9528 // dev port
const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  devServer: {
    /* proxy: { //反向代理
      '/api': { // 此处要与 /services/api.js 中的 API_PROXY_PREFIX 值保持一致
        target: 'http://127.0.0.1:18866',
        changeOrigin: true
      }

    }, */
    port: port,
    open: false,
    overlay: {
      warnings: false,
      errors: true
    }
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "@/styles/variables.scss";@import "@/styles/mixin.scss";` // 配置全局css变量
      }

    }
  },
  configureWebpack: config => {
    const plugins = []
    if (isProd) {
      plugins.push(
        new UglifyJsPlugin({
          uglifyOptions: {
            output: {
              comments: false // 去掉注释
            },
            warnings: false,
            compress: {
              drop_console: true,
              drop_debugger: false,
              pure_funcs: ['console.log']// 移除console
            }
          }
        })
      )

      // 用于根据模块的相对路径生成 hash 作为模块 id, 一般用于生产环境
      plugins.push(
        new HashedModuleIdsPlugin()
      )

      // 取消webpack警告的性能提示
      config.performance = {
        hints: 'warning',
        // 入口起点的最大体积
        maxEntrypointSize: 1000 * 500,
        // 生成文件的最大体积
        maxAssetSize: 1000 * 1000,
        // 只给出 js 文件的性能提示
        assetFilter: function (assetFilename) {
          return assetFilename.endsWith('.js')
        }
      }
    }

    return { plugins }
  },
  chainWebpack(config) {
    config.name = name
    config.resolve.alias.set('@', resolve('src'))
    config.plugin('preload').tap(() => [
      {
        rel: 'preload',
        // to ignore runtime.js
        // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: 'initial'
      }
    ])
    // when there are many pages, it will cause too many meaningless requests
    config.plugins.delete('prefetch')

    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  }
}
