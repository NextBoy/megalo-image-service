const relative = require('relative')
const { ImageProxyPlugin } = require('./server')
const { UploadClientPlugin } = require('./client')
const { getIPAddress, normalize, getHash } = require('./utils')
interface Config {
  target: string
  proxy: {
    port: number
  },
  oss: {
    bucket: string
    region: string
    publicPath: string
    accessKeyId: string
    accessKeySecret: string
    fileType?: RegExp
  }
}

const ImageOperator = (config: Config) => {
  const ip = getIPAddress()
  return {
    upload: () => {
      return new UploadClientPlugin(config.oss, config.target)
  },
    proxy: () => new ImageProxyPlugin({ ip, ...config.proxy, target: config.target }),
    getProxyURI: (localFile: string, dirname: string = __dirname) => {
      const { port } = config.proxy
      let relativePath = normalize(relative(dirname, localFile))
      return `http://${ip}:${port}/${relativePath}`
    },
    getNetURI: (localFile: string) => {
      const { bucket, region, publicPath } = config.oss
      const ext = localFile.split('.').reverse()[0]
      const hash = getHash(localFile)
      return `https://${bucket}.${region}.aliyuncs.com${publicPath}/${hash}.${ext}`
    }
  }
}

module.exports = ImageOperator
