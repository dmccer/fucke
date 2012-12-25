/**
 * 上传文件到服务器
 * 
 * ====
 * 
 * TODO:
 *   1. 服务器账户配置化;
 *   2. 需上传的文件配置化;
 *   3. 是否需要监听本地目录改变配置化;
 *   
 */
var path = require('path'),
    fs = require('fs'),
    wrench = require('wrench'),
    watch = require('watch'),
    next = require('next.js'),
    _ = require('underscore'),
    Ftp = require('jsftp'),
    colorized = require('console-colorjs'),
    count = 0,
    isIgnored,
    addWatcher,
    ftp,
    sync,
    ftpServerConfig;

ftpServerConfig = {
    f2e: {
        server: {
            host: '192.168.1.2',
            user: 'Kane',
            pass: '123456'
        },
        ignore: [
            'sync.js'
        ]
    },
    svger: {
        server: {
            host: '192.168.1.3',
            user: 'Kane',
            pass: 'xxxxxx'
        },
        ignore: [
            'sync.js',
            'custom/min-css.js'
        ]
    }
};

isIgnored = function (file) {
    var v,
        stats,
        result = true,
        dirIgnore = [
            '.git',
            '.',
            'docs',
            'test'
        ],
        filePass = [
            '.html',
            '.htm',
            '.js',
            '.css',
            '.swf',
            '.png',
            '.gif',
            '.jpg'
        ];

    if (fs.existsSync(file)) {
        stats = fs.statSync(file);

        if (stats.isFile()) {
            result = filePass.indexOf(path.extname(file)) === -1;
        } else if (stats.isDirectory()) {
            result = dirIgnore.indexOf(path.basename(file)) !== -1;
        }
    }

    if (!result) {
        result = _.some(dirIgnore, function (item) {
            var rootDir = path.sep + item + path.sep,
                subDir = path.sep + item,
                sIndex = file.length - subDir.length - 1;

            return file.indexOf(rootDir) !== -1 || file.indexOf(subDir) === sIndex;
        });
    }

    return result;
};

ignore = function (dir, dirContents) {
    var ignore = ftpServerConfig.svger.ignore, toUpload;

    toUpload = _.filter(dirContents, function (file) {
        return !isIgnored(path.join(dir, file));
    });

    if (ignore) {
        toUpload = _.difference(toUpload, ignore);
    }

    return toUpload;
};

onlineToUpload = function (dir, dirContents) {
    var res = [
            '.swf',
            '.png',
            '.gif',
            '.jpg'
        ],
        code = [
            '-min.css',
            '-min.js',
            'sea.js',
            'plugin-text.js',
            'plugin-json',
            'plugin-base',
            'sea-config.js'
        ],
        allToUpload = [],        
        li = 0,
        lj = 0,
        ai,
        aj,
        resToUpload,
        removedRes,
        codeToUpload;

    resToUpload = _.filter(dirContents, function (file) {
        return res.indexOf(path.extname(file)) !== -1;
    });

    removedRes = _.difference(dirContents, resToUpload);

    codeToUpload = _.filter(removedRes, function (file) {
        return !!(_.filter(code, function (item) {
            return path.basename(file).indexOf(item) !== -1;
        }).length);
    });

    ai = _.difference(removedRes, codeToUpload);
    aj = _.extend([], resToUpload, codeToUpload);
    
    li = ai.length;
    lj = aj.length;

    allToUpload = _.filter(ai, function (item) {
        return _.some(aj, function (file) {
            return file.indexOf(item) === 0;
        });
    });

    allToUpload = _.union(_.uniq(allToUpload), aj);

    return allToUpload;
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

        ftp.ls(dir, function (err, data) {                      
            if (err) {
                console.log(colorized.bright('获取服务器文件列表发生错误：') + '\n\r' + err);
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

    lser(rmtdir, false);

    timer = setInterval(function () {
        if (!isRunLser && (count - overflow) === 0) {
            clearInterval(timer);

            callback(ret);
        }
    }, 50);
};

mkServerDir = function (rmtdir, dirSet, sDirSet, callback) {
    var timer, isMkd = false, _dirSet = _.extend([], dirSet);

    _mkdir = function (rmtdir, dir) {
        var remote;

        isMkd = true;

        if (sDirSet.indexOf(dir) !== -1) {
            isMkd = false;
            _dirSet = _.without(_dirSet, dir);
            return;
        }

        remote = path.join(rmtdir, dir);
        
        ftp.raw.mkd(remote, function (err, data) {
            if (err) {
                console.log(colorized.bright('创建目录(' + remote + ')失败：') + '\n\r' + err);
            } else {
                console.log(colorized.bright('创建目录成功：') + remote);
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

    _.each(fileSet, function (item) {
        var loc = path.join(dir, item),
            remote = path.join(rmtdir, item);
        
        count ++;
        
        ftp.put(remote, fs.readFileSync(loc), function (err) {
            if (err) {
                console.log(colorized.bright('上传文件(' + remote + ')发生错误：') + '\n\r' + err);
            } else {
                console.log(loc + colorized.bright(' 已成功上传！'))
            }

            count --;
        });
    });

    timer = setInterval(function () {
        if (count === 0) {
            clearInterval(timer);
            callback();
        }
    });
};

close = function () {
    ftp.raw.quit(function(err, data) {
        if (err) {
            console.log(colorized.bright('上传过程发生错误：') + '\n\r' + err);
        } else {
            console.log(colorized.bright('所有文件上传成功！'));
        }
    });
};

sync = function (dir, rmtdir) {
    var isMkd = false, dirContents, dirSet, fileSet;
    
    ftp = new Ftp(ftpServerConfig.f2e.server);

    listServerFiles(ftp, rmtdir, function (ret) {
        dirContents = wrench.readdirSyncRecursive(dir);
        
        dirContents = ignore(dir, onlineToUpload(dir, dirContents))

        dirSet = _.filter(dirContents, function (item) {
            var loc = path.join(dir, item),
                stats = fs.statSync(loc);

            return stats.isDirectory();
        });

        dirSet.sort(function (a, b) {
            var num_a = a.length - a.replace(/(\/)|(\\\\)|(\\)/g, '').length,
                num_b = a.length - b.replace(/(\/)|(\\\\)|(\\)/g, '').length;

            return num_a - num_b;
        });        

        fileSet = _.difference(dirContents, dirSet);

        mkServerDir(rmtdir, dirSet, ret, function () {
            console.log(colorized.bright('所有目录已在服务器创建成功！'));

            mkServerFile(dir, rmtdir, fileSet, function () {                
                console.log(colorized.bright('所有文件已在服务器创建成功！'));
                close();
            });            
        });       
    });
};

addWatcher = function (dir, rmtdir) {
    var upload, rmfile;
    
    upload = function (f) {
        var loc = path.join(dir, f),
            remote = path.join(rmtdir, f),
            stats;

        stats = fs.statSync(loc);

        if (stats.isFile()) {
            ftp.put(remote, fs.readFileSync(loc), function (err) {
                if (err) {
                    console.log(colorized.bright('上传文件(' + remote + ')发生错误：') + '\n\r' + err);
                } else {
                    console.log(loc + colorized.bright(' 文件成功上传！'));
                }
            });    
        } else if (stats.isDirectory()) {
            ftp.raw.mkd(remote, function (err, data) {
                if (err) {
                    console.log(colorized.bright('上传目录(' + remote + ')发生错误： ' + '\n\r' + err));
                } else {
                    console.log(loc + colorized.bright(' 目录成功上传'));
                }
            });
        }        
    };

    rmfile = function (f) {
        var loc = path.join(dir, f),
            remote = path.join(rmtdir, f);
        
        ftp.raw.dele(remote, function (err) {
            if (err) {
                // 由于删除的文件/目录无法判断到底是文件还是目录，若文件删除失败，则可能是目录
                ftp.raw.rmd(remote, function (err) {
                    if (err) {
                        console.log(colorized.bright('服务器目录(' + remote + ')删除失败：') + '\n\r' + err);
                    } else {
                        console.log(loc + colorized.bright(' 服务器目录成功删除！'));
                    }
                });
            } else {
                console.log(loc + colorized.bright(' 服务器文件成功删除！'));
            }
        });      
    };

    watch.createMonitor(dir, function (monitor) {
        monitor.on('created', function (f, stat) {
            upload(path.relative(dir, f))
        });

        monitor.on('changed', function (f, cur, pre) {            
            upload(path.relative(dir, f));
        });

        monitor.on('removed', function (f, stat) {
            rmfile(path.relative(dir, f));
        });
    });
};

module.exports = function (dir, remote, options) {
    dir = path.resolve(dir);

    fs.stat(dir, function (err, stats) {
        if (err) {
            console.log(colorized.bright('错误：指定上传的目录(' + dir + ')不存在!'));
        } else {
            console.log(colorized.bright('即将上传该目录下的所有文件：') + dir + '\n\r请稍等......');

            next.pipe(
                function (callback) {
                    sync(dir, remote);
                    callback();
                },
                function (callback) {
                    if (options.watch) {
                        addWatcher(dir, remote);    
                    }
                    
                }
            )(function (err) {
                console.log(colorized.bright('未知错误：') + '\n\r', err);
            });
        }
    });
};

//./biz-static/testftp
// ./public_ftp/testftp
module.exports('../../tester/dp_sys', './biz-static/testftp');

