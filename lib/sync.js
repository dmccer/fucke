var path = require('path'),
    fs = require('fs'),
    wrench = require('wrench'),
    next = require('next.js'),
    _ = require('underscore'),
    Ftp = require('jsftp'),
    colorized = require('console-colorjs'),
    count = 0,
    isIgnored,
    ftp,
    sync,
    ftpServerConfig;

ftpServerConfig = {
    f2e: {
        host: '192.168.1.2',
        user: 'Kane',
        pass: 'xxxxxx'
    },
    svger: {
        host: '192.168.1.2',
        user: 'kane',
        pass: 'xxxxxx'
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

            console.log('server response: ', isMkd);
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
    var isMkd = false, dirContents, dirSet, fileSet;

    ftp = new Ftp(ftpServerConfig.svger);

    listServerFiles(ftp, rmtdir, function (ret) {
        dirContents = wrench.readdirSyncRecursive(dir);

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

        console.log('To upload files or dirs: ', ret.join('\t'));

        mkServerDir(rmtdir, dirSet, ret, function () {
            console.log(colorized.bright('Every dir is maked on server!'));

            mkServerFile(dir, rmtdir, fileSet, function () {                
                console.log(colorized.bright('Every file is maked on server!'));
                close();
            });            
        });       
    });
};

module.exports = function (dir, remote) {
    dir = path.resolve(dir);

    console.log(colorized.bright('即将上传该目录下的所有文件：') + dir + '\n\r请稍等......');

    next.pipe(
        function (callback) {
            sync(dir, remote);
        }
    )(function (err) {
        console.log(colorized.bright('上传过程发生错误：') + '\n\r', err);
    });
};

//./biz-static/testftp
// ./public_ftp/testftp
module.exports('./', './public_ftp/testftp');

