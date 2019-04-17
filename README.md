# megalo-image-service
基于webpack的图片插件，特别适合开发小程序。

由于小程序包大小的限制，因此对于图片资源我们需要放在线上，megalo-iamge-service很好的解决了这个问题。

其主要功能有：
- 开发环境下在本地启动node服务器模拟预览图片
- 正式环境下自动上传图片到阿里云OSS对象存储（暂时不支持腾讯云，后续支持）

便利性：
megalo-image-service会暴露出接口生成可访问的资源地址，
结合url-loader或者file-loader配置进行自动替换。

## install
```npm
npm install megalo-image-service --save-dev
```
## use

```js
const ImageOperator = require('megalo-image-service')
const imageOperator = ImageOperator({
  target:  path.resolve(__dirname, './src'), // 图片资源文件夹
  proxy: {
    port: 8888 // 本地node图片服务器启动端口
  },
  // oss的配置可以看阿里云的文档 https://help.aliyun.com/document_detail/64097.html?spm=a2c4g.11186623.6.1009.293d5f81ri8yCS
  oss: {
    region: '', // bucket所在的区域
    accessKeyId: '', // 用户标识
    accessKeySecret: '', // 用户秘钥
    bucket: '', // 通过控制台或putBucket创建的bucket
    publicPath: '/', // 图片存储的公共路径
    fileType: '' // 非必填参数，表示要上传的文件类型，是一个正则表达式 默认值为 /\.(svg|png|jpe?g|gif)$/i
  }
})
```
第二步：将插件添加到webpack中
```webpack.config.js
plugins: [
    // 开发环境采用本地mock,正式环境自动上传，根据自己的需要进行配置
    process.env.NODE_ENV === 'development' ? imageOperator.proxy() : imageOperator.upload()
]
```
第三步：修改url-loader或者file-loader的配置
```js
{
        test: /\.(svg|png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1,
              emitFile: false, // 禁止生成图片文件
              name: (localPath) => localPath,
              publicPath: (localPath) => {
                if (process.env.NODE_ENV === 'development') {
                  return imageOperator.getProxyURI(localPath)
                } else {
                  return imageOperator.getNetURI(localPath)
                }
              }
            }
          }
        }
```
## megalo框架配置文件
如果你是采用网易考拉的megalo小程序框架，
需要修改megalo.config.js如下，其他基于webpack打包的小程序框架根据自身的配置修改webpack配置即可
```megalo.config.js
const path = require('path')
const ImageOperator = require('megalo-image-service')
const imageOperator = ImageOperator({
  target:  path.resolve(__dirname, './src'),
  proxy: {
    port: 8888
  },
  oss: {
    region: '',
    accessKeyId: '',
    accessKeySecret: '',
    bucket: '',
    publicPath: '/megalo-assets'
  }
})
module.exports = {
  // 构件生产模式时是否生成source map（仅在process.env.NODE_ENV === 'production' 时该选项生效）
  productionSourceMap: false,

  // 开启eslint格式化代码
  lintOnSave: true,

  configureWebpack: config => {
    // 你可以在这里粗放的修改webpack的配置并返回
    console.log('configureWebpack执行了')
    if (process.env.NODE_ENV === 'development') {
      return {
        plugins: [
          imageOperator.proxy()
        ]
      }
    }
    return {
      plugins: [
        imageOperator.upload()
      ]
    }
  },
  chainWebpack: chainConfig => {
    // 你可以在这里通过 https://github.com/neutrinojs/webpack-chain 来精细的修改webpack配置
    // 重写vue-loader的配置，让图片自动require
    chainConfig.module
      .rule('vue')
      .use('vue')
      .options({
        compilerOptions: {
          preserveWhitespace: false
        },
        transformToRequire: {
          video: 'src',
          source: 'src',
          img: 'src',
          image: 'src'
        }
      })
    // 重写url-loader的逻辑，让其使用线上图片的路径
    chainConfig.module
      .rule('picture')
      .use('url')
      .loader('url-loader')
      .options({
        limit: 1,
        emitFile: false, // 禁止webpack生成图片到dist目录
        name: (localPath) => localPath,
        publicPath: (localPath) => {
          if (process.env.NODE_ENV === 'development') {
            return imageOperator.getProxyURI(localPath)
          } else {
            return imageOperator.getNetURI(localPath)
          }
        }
      })
    // console.log('chainWebpack执行了', chainConfig.toString())
  },
  // 原生小程序组件存放目录，默认为src/native
  // 如果你有多个平台的原生组件，你应当在此目录下再新建几个子文件夹，我们约定，子文件夹名和平台的名字一致:
  // 微信小程序组件则命名为 'wechat'，支付宝为'alipay', 百度为 'swan'
  // 如果只有一个平台，则无需再新建子文件夹
  nativeDir: '/src/native',

  css: {
    loaderOptions: {
      css: {
        // https://github.com/webpack-contrib/css-loader#options
      },
      less: {
        // https://github.com/webpack-contrib/less-loader
      },
      sass: {
        // https://github.com/webpack-contrib/sass-loader
      },
      stylus: {
        // https://github.com/shama/stylus-loader
      },
      // https://github.com/megalojs/megalo-px2rpx-loader
      px2rpx: {
        rpxUnit: 1
      }
    }
  }
}


```
