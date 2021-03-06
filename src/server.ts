interface Options {
  port: number
  target: string
  ip: string
}
exports.ImageProxyPlugin = class ImageProxyPlugin {

  constructor(options: Options) {
    this.options = options
  }
  options: Options
  apply (compiler) {
    compiler.plugin('environment', (stats) => {
      this.createServer(this.options)
    })
    compiler.plugin('failed', (err) => {
    })
  }
  createServer ({ target, ip, port }) {
    const portfinder = require('portfinder')
    const express = require('express')
    const path = require('path')
    const chalk = require('chalk')
    const app = express()
    const route = path.basename(target)
    app.use(`/${route}`, express.static(target))

    return new Promise((resolve, reject) => {
      portfinder.basePort = port // default: 8000
      portfinder.highestPort = port
      portfinder.getPortPromise()
        .then(port => {
          app.listen(port, '0.0.0.0')
          console.log(chalk.green.bold(`image-proxy-server is running  => http://${ip}:${port}`))
          resolve(`http://${ip}:${port}`)
        }).catch(error => {
        reject(error)
      })
    })
  }
}

