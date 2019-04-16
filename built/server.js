exports.ImageProxyPlugin = (function () {
    function ImageProxyPlugin(options) {
        this.options = options;
    }
    ImageProxyPlugin.prototype.apply = function (compiler) {
        var _this = this;
        compiler.plugin('environment', function (stats) {
            _this.createServer(_this.options);
        });
        compiler.plugin('failed', function (err) {
        });
    };
    ImageProxyPlugin.prototype.createServer = function (_a) {
        var target = _a.target, ip = _a.ip, port = _a.port;
        var portfinder = require('portfinder');
        var express = require('express');
        var path = require('path');
        var chalk = require('chalk');
        var app = express();
        var route = path.basename(target);
        app.use("/" + route, express.static(target));
        return new Promise(function (resolve, reject) {
            portfinder.basePort = port;
            portfinder.highestPort = port;
            portfinder.getPortPromise()
                .then(function (port) {
                app.listen(port, '0.0.0.0');
                console.log(chalk.green.bold("image-proxy-server is running  => http://" + ip + ":" + port));
                resolve("http://" + ip + ":" + port);
            }).catch(function (error) {
                reject(error);
            });
        });
    };
    return ImageProxyPlugin;
}());
