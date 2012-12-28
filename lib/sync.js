/**
 * 上传文件到服务器
 *
 * ---
 * 
 * 作者 Kane dmccer@gmail.com
 * 时间：2012-12-28 
 *
 * ---
 *
 * TODO:
 *   1. 服务器账户配置化; - done
 *   2. 需上传的文件配置化; - done
 *   3. 是否需要监听本地目录改变配置化; -done
 *   4. 检测是否登录成功;
 *   5. 完善代码注释;
 *   6. 将文件和文件夹上传单独抽取出来;
 *   7. 文件和文件夹过滤规则完善;
 *   8. 提供web使用界面;
 *   9. 注入源码合并压缩功能;
 *   10. 记录操作日志;
 *   11. ...
 *
 */
var path = require('path'),
    fs = require('fs'),
    os = require('os'),
    wrench = require('wrench'),
    watch = require('watch'),
    next = require('next.js'),
    _ = require('underscore'),
    Ftp = require('jsftp'),
    colorized = require('console-colorjs'),
    config = require('./config'),
    uploadFilter= require('./upload-filter'),
    NL = '\n\r',
    DELIMITER_TITLE = '=============================',
    DELIMITER_BODY = '------------------------------',
    ftp,
    sync,
    isIgnored,
    ignore,
    onlineToUpload,
    addWatcher,
    listServerFiles,
    pathEnvConverter,
    mkServerDir,
    mkServerFile,
    mkRemotedir,
    getFtpServerInfo,
    closeFtp,
    upload,
    rmfile;

pathEnvConverter = function (toType, p) {
    var r = p;

    if (toType !== os.platform()) {
        switch (ftp.info.type) {
            case 'unix':
                r = p.replace(/(\\\\)|(\\)/g, '\/');
                break;
            case 'win32':
                r = p.replace(/\//g, '\\\\');
                break;
            default:
                break;
        }
    }

    return r;
};

listServerFiles = function (ftp, rmtdir, callback) {
    var ret = [],
        count = 0,
        isRunLser = false,
        overflow = 0,
        lser,
        timer;

    console.log('服务器目录：', rmtdir);

    if (!ftp) {
        console.log('FTP没有实例化！');
        return;
    }

    lser = function (dir, isChild) {
        isRunLser = true;

        ftp.ls(pathEnvConverter(ftp.info.type, dir), function (err, data) {
            if (err) {
                console.log(colorized.bright('获取服务器文件列表发生错误：') + NL + err);
            } else {                
                if (!data.length) {
                    isRunLser = false;
                    isChild && (overflow += 1);
                    return;
                }

                _.each(data, function (item) {
                    var p = path.join(dir, item.name);

                    count ++;

                    if (item.type) {                        
                        lser(p, true);
                    } else {
                        count --;
                    }

                    ret.push(p.replace(path.join(rmtdir, '/'), ''));
                });
            }

            isRunLser = false;
            isChild && (overflow += 1);
        });
    };

    lser(pathEnvConverter(ftp.info.type, rmtdir), false);

    timer = setInterval(function () {
        if (!isRunLser && (count - overflow) === 0) {
            clearInterval(timer);

            callback(ret);
        }
    }, 50);
};

mkServerDir = function (rmtdir, dirSet, sDirSet, callback) {
    var timer,
        _mkdir,
        isMkd = false,
        _dirSet = _.extend([], dirSet);

    _mkdir = function (rmtdir, dir) {
        var remote;

        isMkd = true;

        if (sDirSet.indexOf(dir) !== -1) {
            isMkd = false;
            _dirSet = _.without(_dirSet, dir);
            return;
        }
        
        remote = path.join(rmtdir, dir);

        ftp.raw.mkd(pathEnvConverter(ftp.info.type, remote), function (err, data) {
            if (err && err.code !== 550) {           
                console.log(colorized.bright('创建目录(' + remote + ')失败：') + NL + err);
            } else {
                console.log(colorized.bright('创建目录成功：') + dir);
            }

            isMkd = false;
            _dirSet = _.without(_dirSet, dir);
        });
    };

    timer = setInterval(function () {
        var l = _dirSet.length;
        
        if (!isMkd && l > 0) {
            _mkdir(rmtdir, _dirSet[l - 1]);
        }

        if (l === 0) {
            clearInterval(timer);
            callback();
        }
    }, 100);
};

mkServerFile = function (dir, rmtdir, fileSet, callback) {
    var count = 0, timer;

    console.log(colorized.bright('开始上传文件：'));

    _.each(fileSet, function (item) {
        var loc = path.join(dir, item),
            remote = path.join(rmtdir, item);
        
        count ++;

        ftp.put(
            pathEnvConverter(ftp.info.type, remote),
            fs.readFileSync(loc),
            function (err) {
                if (err) {
                    console.log(colorized.bright('上传文件(' + remote + ')发生错误：') + NL + err);
                } else {
                    console.log(path.relative(dir, loc) + colorized.bright(' 已成功上传！'))
                }

                count --;
            }
        );
    });

    timer = setInterval(function () {
        if (count === 0) {
            clearInterval(timer);
            callback();
        }
    });
};

getFtpServerInfo = function (ftp, callback) {
    console.log('获取服务器系统信息');

    // 获取服务器系统信息
    ftp.raw.syst(function (err, data) {
        if (err) {
            console.log(colorized.bright('获取服务器信息失败：') + NL + err);
            throw err;
        }

        ftp.info = ftp.info || {};
        ftp.info.type = ftp.system.toLowerCase().indexOf('unix') === -1 ? 'win32' : 'unix';

        console.log(colorized.bright('成功获取服务器系统信息'), NL + DELIMITER_BODY);
        callback();
    });
};

mkRemotedir = function (ftp, rmtdir, callback) {
    var i = 0,
        l = 0,
        ret = [],
        dirSet = rmtdir.split(path.sep),
        isCompleteMkdir = false,
        isReceivedServerInfo = false,
        timer,
        tmp,
        j;

    for (l = dirSet.length; i < l; i++) {
        tmp = '';
        
        for (j = 0; j <= i; j++) {
            tmp = path.join(tmp, dirSet[j]);
        }

        ret.push(tmp);
    }

    getFtpServerInfo(ftp, function () {
        console.log('检测服务器是否存在目录：', rmtdir);

        _.each(ret, function (item) {
            ftp.raw.mkd(pathEnvConverter(ftp.info.type, item), function (err) {
                if (err && err.code !== 550) {
                    console.log(colorized.bright('上传目录(' + item + ')发生错误： ' + NL + err));
                } else if (!err) {
                    console.log(colorized.bright('成功新建服务器目录：'), item);
                }

                if (ret.indexOf(item) === ret.length - 1) {
                    isCompleteMkdir = true;
                }
            });
        });

        isReceivedServerInfo = true;
    });  

    timer = setInterval(function () {
        if (isReceivedServerInfo && isCompleteMkdir) {
            clearInterval(timer);

            console.log(colorized.bright('服务器已存在目录：' + rmtdir), NL + DELIMITER_BODY);
            callback();
        }
    }, 10);
};

closeFtp = function () {
    ftp.raw.quit(function (err) {
        if (err) {
            console.log(colorized.bright('断开ftp链接时发生错误：') + NL + err);
        }
    });
};

sync = function (dir, rmtdir, env) {
    var dirContents, dirSet, fileSet;
    
    ftp = new Ftp(env.server);

    mkRemotedir(ftp, rmtdir, function () {
        listServerFiles(ftp, rmtdir, function (ret) {
            // 获取需要上传的目录下所有文件
            dirContents = wrench.readdirSyncRecursive(dir);

            // 根据指定方式过滤文件和文件夹
            dirContents = uploadFilter(dir, dirContents);

            // 过滤配置文件中指定的文件
            if (env.ignore) {
                dirContents = _.difference(dirContents, env.ignore);
            }

            // 过滤出需要上传的目录
            dirSet = _.filter(dirContents, function (item) {
                var loc = path.join(dir, item),
                    stats = fs.statSync(loc);

                return stats.isDirectory();
            });

            // 根据目录路径排序，确认目录的层级，长度越短的层级越浅
            dirSet.sort(function (a, b) {
                var numA = a.length - a.replace(/(\/)|(\\)/g, '').length,
                    numB = a.length - b.replace(/(\/)|(\\)/g, '').length;

                return numA - numB;
            });

            // 忽略掉所有需要上传的目录，过滤出所有需要上传的文件
            fileSet = _.difference(dirContents, dirSet);

            // 先在服务器上创建好所有目录
            mkServerDir(rmtdir, dirSet, ret, function () {
                console.log(
                    colorized.bright('所有目录已在服务器创建成功！'),
                    NL + DELIMITER_BODY
                );

                // 然后再上传文件
                mkServerFile(dir, rmtdir, fileSet, function () {
                    console.log(colorized.bright('所有文件已在服务器创建成功！'), NL + DELIMITER_BODY);
                    closeFtp();
                });
            });
        });
    });
};

upload = function (dir, rmtdir, f) {
    var loc = path.join(dir, f),
        remote = path.join(rmtdir, f),
        stats;

    stats = fs.statSync(loc);

    if (stats.isFile()) {
        ftp.put(pathEnvConverter(ftp.info.type, remote), fs.readFileSync(loc), function (err) {
            if (err) {
                console.log(colorized.bright('上传文件(' + remote + ')发生错误：') + NL + err);
            } else {
                console.log(loc + colorized.bright(' 文件成功上传！'));
            }
        });
    } else if (stats.isDirectory()) {
        ftp.raw.mkd(pathEnvConverter(ftp.info.type, remote), function (err) {
            if (err && err.code !== 550) {
                console.log(colorized.bright('上传目录(' + remote + ')发生错误： ' + NL + err));
            } else {
                console.log(loc + colorized.bright(' 目录成功上传'));
            }
        });
    }
};

remove = function (dir, rmtdir, f) {
    var loc = path.join(dir, f),
        remote = path.join(rmtdir, f);
    
    ftp.raw.dele(pathEnvConverter(ftp.info.type, remote), function (err) {
        if (err) {
            // 由于删除的文件/目录无法判断到底是文件还是目录，若文件删除失败，则可能是目录
            ftp.raw.rmd(pathEnvConverter(ftp.info.type, remote), function (err) {
                if (err) {
                    console.log(colorized.bright('服务器目录(' + remote + ')删除失败：') + NL + err);
                } else {
                    console.log(path.relative(dir, loc) + colorized.bright(' 服务器目录成功删除！'));
                }
            });
        } else {
            console.log(path.relative(dir, loc) + colorized.bright(' 服务器文件成功删除！'));
        }
    });
};

addWatcher = function (dir, rmtdir) {
    watch.createMonitor(dir, function (monitor) {
        monitor.on('created', function (f) {
            upload(dir, rmtdir, path.relative(dir, f))
        });

        monitor.on('changed', function (f) {
            upload(dir, rmtdir, path.relative(dir, f));
        });

        monitor.on('removed', function (f) {
            remove(dir, rmtdir, path.relative(dir, f));
        });
    });
};

module.exports = function (env, options) {
    var dir, remote, curEnvConfig;

    curEnvConfig = config[env];

    if (!config) {
        console.log(colorized.bright('找不到配置文件：' + path.resolve('./config')));
        return;
    } else if (!curEnvConfig.locPath) {
        console.log(colorized.bright('配置文件(' + path.resolve('./config') + ')中没有设置需要上传的目录'));
        return;
    } else if (!curEnvConfig.remotePath) {
        console.log(colorized.bright('配置文件(' + path.resolve('./config') + ')中没有设置上传到服务器的路径'));
        return;
    } else if (!curEnvConfig.server) {
        console.log(colorized.bright('配置文件(' + path.resolve('./config') + ')中没有设置服务器配置'));
        return;
    }

    dir = pathEnvConverter(os.platform(), path.resolve(curEnvConfig.locPath));
    remote = pathEnvConverter(os.platform(), path.join(curEnvConfig.remotePath));

    fs.stat(dir, function (err, stats) {
        if (err || !stats.isDirectory()) {
            console.log(colorized.bright('错误：指定上传的目录(' + dir + ')不存在!'));
        } else {
            console.log(colorized.bright('即将上传：'), dir, NL + DELIMITER_BODY);

            next.pipe(
                function (callback) {
                    sync(dir, remote, curEnvConfig);
                    callback();
                },
                function () {
                    if (options.watch) {
                        console.log(colorized.bright('已开启监控目录变化！') + NL + DELIMITER_BODY);
                        addWatcher(dir, remote);
                    }
                }
            )(function (err) {
                console.log(colorized.bright('未知错误：') + NL, err);
            });
        }
    });
};
