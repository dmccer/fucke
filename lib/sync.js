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
    sync;

isIgnored = function (file) {
    var v, stats = fs.statSync(file);

    v = stats.isFile() 
        ? path.extname(file) 
        : (stats.isDirectory() ? path.basename(file) : '');

    return ['.git', '', '.'].indexOf(v) !== -1;
};

sync = function (dir, rmtdir) {
    var isMkd = false, timer;

    ftp = new Ftp({
        host: '192.168.8.174',
        user: 'e2f',
        pass: '654321'
    });

    wrench.readdirRecursive(dir, function (err, curr) {
        var upload;

        if (err) {
            console.log(colorized.bright('读取本地文件出错：') + '\n\r' + err);
        }

        upload = function (curr) {
            _.each(curr, function (item) {
                var loc = path.join(dir, item),
                    remote = path.join(rmtdir, item),
                    stats;
                
                count++;

                if (!isIgnored(loc)) {
                    stats = fs.statSync(loc);

                    console.log('loc: ', loc)

                    if (stats.isDirectory()) {
                        isMkd = true;

                        ftp.raw.mkd(remote, function (err, data) {
                            if (err) {
                                console.log(colorized.bright('创建目录失败：：') + '\n\r' + err);
                            } else {
                                console.log(colorized.bright('创建目录成功：') + remote);
                            }

                            isMkd = false;
                            count--;

                            console.log('server response: ', data)                            
                        });

                    } else if (stats.isFile()) {                        
                        ftp.put(remote, fs.readFileSync(loc), function (err) {
                            if (err) {
                                console.log(colorized.bright('put-err: ') + '\n\r' + err);
                            }
                        });
                        
                        count--;

                        //console.log(loc + colorized.bright(' 已上传'));
                    }
                }
            });
        };

        upload(curr);

        // timer = setInterval(function () {            
        //     if (curr && !isMkd) {
        //         clearInterval(timer);
        //         upload(curr);
        //     }
        // }, 100);
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
            var timer;

            timer = setInterval(function () {
                if (count === 0) {
                    ftp.raw.quit(function(err, data) {
                        if (err) {
                            console.log(colorized.bright('上传过程发生错误：') + '\n\r' + err);
                        } else {
                            console.log(colorized.bright('所有文件上传成功！'));
                        }
                    });

                    clearInterval(timer);
                }
            }, 800);            
        }
    )(function (err) {
        console.log(colorized.bright('上传过程发生错误：') + '\n\r', err);
    });
};

module.exports('./', './biz-static/testftp');

