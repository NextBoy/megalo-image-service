var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var OSS = require('ali-oss');
var chalk = require('chalk');
var glob = require('glob');
var Operator = (function () {
    function Operator(config, target) {
        this.allReady = false;
        this.target = target;
        this.config = config;
        this.config.fileType = this.config.fileType || /\.(png|jpe?g|gif)$/i;
        this.client = new OSS(config);
        var bucket = config.bucket;
        this.client.useBucket(bucket);
        console.log(chalk.yellow.bold("----\u5F53\u524Dbucket: " + bucket + "----"));
        this.alreadyUpList = {
            ready: false,
            info: []
        };
    }
    Operator.prototype.getupFileQueue = function () {
        var _this = this;
        var normalize = require('./utils').normalize;
        var target = normalize(this.target);
        var patterns = target + "/**/*.**";
        var queue = glob
            .sync(patterns, { matchBase: true })
            .filter(function (file) { return _this.config.fileType.test(file); })
            .map(function (file) { return normalize(file); });
        return queue;
    };
    Operator.prototype.upFiles = function () {
        var _this = this;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var relative_1, _a, normalize_1, getHash_1, queue, count_1, _loop_1, this_1, i, e_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        relative_1 = require('relative');
                        _a = require('./utils'), normalize_1 = _a.normalize, getHash_1 = _a.getHash;
                        queue = this.getupFileQueue();
                        count_1 = queue.length;
                        _loop_1 = function (i) {
                            var localFile, ext, hash, objectName, relativePath, upStatus;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        localFile = normalize_1(queue[i]);
                                        ext = localFile.split('.').reverse()[0];
                                        hash = getHash_1(localFile);
                                        objectName = this_1.config.publicPath + "/" + hash + "." + ext;
                                        relativePath = normalize_1(relative_1(__dirname, localFile)).replace(/\.\.(\/)/g, '');
                                        return [4, this_1.checkFileUpStatus(objectName)];
                                    case 1:
                                        upStatus = _a.sent();
                                        if (!upStatus) {
                                            console.log(chalk.yellow("\n----" + relativePath + "\u6CA1\u6709\u5728\u4E0A\u4F20\u8BB0\u5F55\u4E2D\uFF0C\u5DF2\u8FDB\u5165\u4E0A\u4F20\u961F\u5217...\n"));
                                            this_1.client.put(objectName, localFile).then(function () {
                                                console.log(chalk.green.bold("\ntips: => " + relativePath + " upload success!\n"));
                                                if (--count_1 === 0) {
                                                    _this.allReady = true;
                                                    resolve();
                                                }
                                            });
                                        }
                                        else {
                                            if (--count_1 === 0) {
                                                this_1.allReady = true;
                                                resolve();
                                            }
                                        }
                                        return [2];
                                }
                            });
                        };
                        this_1 = this;
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < queue.length)) return [3, 4];
                        return [5, _loop_1(i)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        i++;
                        return [3, 1];
                    case 4: return [3, 6];
                    case 5:
                        e_1 = _b.sent();
                        console.log(e_1);
                        return [3, 6];
                    case 6: return [2];
                }
            });
        }); });
    };
    Operator.prototype.checkFileUpStatus = function (object) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.client.get(object).then(function (result) {
                if (result.res.status === 200) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            }).catch(function (e) {
                if (e.code === 'NoSuchKey') {
                    resolve(false);
                }
            });
        });
    };
    Operator.prototype.printStatus = function () {
        if (this.allReady) {
            console.log(chalk.yellow.bold("\nOSS\u56FE\u7247\u8D44\u6E90\u5168\u90E8\u51C6\u5907\u5C31\u7EEA\uFF01"));
        }
        else {
            console.log(chalk.red.bold("\nOSS\u56FE\u7247\u8D44\u6E90\u72B6\u6001\u672A\u77E5\uFF01"));
        }
    };
    return Operator;
}());
exports.UploadClientPlugin = (function () {
    function UploadClientPlugin(config, target) {
        this.target = target;
        this.config = config;
    }
    UploadClientPlugin.prototype.apply = function (compiler) {
        var _this = this;
        var operator = new Operator(this.config, this.target);
        compiler.plugin('environment', function (stats) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, operator.upFiles()];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        }); });
        compiler.plugin('done', function (stats) {
            operator.printStatus();
        });
    };
    return UploadClientPlugin;
}());
