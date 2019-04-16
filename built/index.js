var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var relative = require('relative');
var ImageProxyPlugin = require('./server').ImageProxyPlugin;
var UploadClientPlugin = require('./client').UploadClientPlugin;
var _a = require('./utils'), getIPAddress = _a.getIPAddress, normalize = _a.normalize, getHash = _a.getHash;
var ImageOperator = function (config) {
    var ip = getIPAddress();
    return {
        upload: function () {
            return new UploadClientPlugin(config.oss, config.target);
        },
        proxy: function () { return new ImageProxyPlugin(__assign({ ip: ip }, config.proxy, { target: config.target })); },
        getProxyURI: function (localFile, dirname) {
            if (dirname === void 0) { dirname = __dirname; }
            var port = config.proxy.port;
            var relativePath = normalize(relative(dirname, localFile));
            return "http://" + ip + ":" + port + "/" + relativePath;
        },
        getNetURI: function (localFile) {
            var _a = config.oss, bucket = _a.bucket, region = _a.region, publicPath = _a.publicPath;
            var ext = localFile.split('.').reverse()[0];
            var hash = getHash(localFile);
            return "https://" + bucket + "." + region + ".aliyuncs.com" + publicPath + "/" + hash + "." + ext;
        }
    };
};
module.exports = ImageOperator;
