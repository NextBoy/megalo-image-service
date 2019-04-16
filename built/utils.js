var fs = require('fs');
var md5 = require('md5');
var path = require('path');
var os = require('os');
exports.normalize = function (pathStr) { return pathStr.split(path.sep).join('/'); };
exports.getHash = function (localPath) {
    var file = fs.readFileSync(localPath);
    return md5(file);
};
exports.getIPAddress = function () {
    var interfaces = os.networkInterfaces();
    for (var devName in interfaces) {
        var iFace = interfaces[devName];
        for (var i = 0; i < iFace.length; i++) {
            var alias = iFace[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    console.warn('没有获取到ip，可能导致手机无法预览, 当前默认为localhost');
    return 'localhost';
};
