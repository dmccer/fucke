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
            pass: 'xxxxxx'
        },
        ignore: [
            'sync.js'
        ]
    },
    svger: {
        server: {
            host: '173.231.39.213',
            user: 'svgercom',
            pass: 'yunhua190926xiao'
        },
        ignore: [
            'sync.js',
            'custom/min-css.js'
        ]
    }
};

isIgnored = function (file) {
    var v, stats = fs.statSync(file);

    v = stats.isFile() 
        ? path.extname(file) 
        : (stats.isDirectory() ? path.basename(file) : '');

    return ['.git', '', '.'].indexOf(v) !== -1;
};

listServerFiles = function (ftp, rmtdir, callback) {
    var ret = [],
        count = 0,
        isRunLser = false,
        overflow = 0,
        lser,
        timer;

    console.log('To List: ', rmtdir);

    if (!ftp) {
        console.log('ftp is not ok!');
        return;
    }

    lser = function (dir, isChild) {
        isRunLser = true;

        ftp.ls(dir, function (err, data) {                      
            if (err) {
                console.log(colorized.bright('List server files error:') + '\n\r' + err);
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
                console.log(colorized.bright('创建目录失败：：') + '\n\r' + err);
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
                console.log(colorized.bright('put-err: ') + '\n\r' + err);
            } else {
                console.log(loc + colorized.bright(' is uploaded to server!'))
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
    var isMkd = false, dirContents, dirSet, fileSet, ignore;

    ignore = ftpServerConfig.svger.ignore;

    ftp = new Ftp(ftpServerConfig.svger.server);

    listServerFiles(ftp, rmtdir, function (ret) {
        dirContents = wrench.readdirSyncRecursive(dir);

        if (ignore) {
            dirContents = _.difference(dirContents, ignore);
        }

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
            console.log(colorized.bright('Every dir is maked on server!'));

            mkServerFile(dir, rmtdir, fileSet, function () {                
                console.log(colorized.bright('Every file is maked on server!'));
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
                    console.log(colorized.bright('Upload file error: ') + '\n\r' + err);
                } else {
                    console.log(loc + colorized.bright(' upload success!'));
                }
            });    
        } else if (stats.isDirectory()) {
            ftp.raw.mkd(remote, function (err, data) {
                if (err) {
                    console.log(colorized.bright('Directory upload error: ' + '\n\r' + err));
                } else {
                    console.log(loc + colorized.bright(' directory upload success!'));
                }
            });
        }
        
    };

    rmfile = function (f) {
        var loc = path.join(dir, f),
            remote = path.join(rmtdir, f);
        
        ftp.raw.dele(remote, function (err) {
            if (err) {
                //console.log(colorized.bright('Remove file error: ') + '\n\r' + err);
                
                ftp.raw.rmd(remote, function (err) {
                    if (err) {
                        console.log(colorized.bright('Remove directory error: ') + '\n\r' + err);
                    } else {
                        console.log(loc + colorized.bright(' directory remove success!'));
                    }
                });
            } else {
                console.log(loc + colorized.bright(' remove success!'));
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

module.exports = function (dir, remote) {
    dir = path.resolve(dir);

    console.log(colorized.bright('即将上传该目录下的所有文件：') + dir + '\n\r请稍等......');

    next.pipe(
        function (callback) {
            sync(dir, remote);
            callback();
        },
        function (callback) {
            addWatcher(dir, remote);
        }
    )(function (err) {
        console.log(colorized.bright('上传过程发生错误：') + '\n\r', err);
    });
};

//./biz-static/testftp
// ./public_ftp/testftp
module.exports('./', './public_ftp/testftp');

