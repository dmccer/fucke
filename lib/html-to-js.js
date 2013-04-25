/**
<<<<<<< HEAD
 * HTML tO JS of AMD
 * =================
 *
 * 作者 [Kane](http://www.svger.com 'BLOG') <dmccer@gmail.com>
 *
 * 时间：*2012-12-28*
 *
 * 功能
 * ----
 * 1. 监控指定目录下的html/htm文件的改变
 * 2. 将其转换为AMD模式的js文件
=======
 * 功能：监控指定目录下的html/htm文件，将其转换为seajs模式的js文件
 * 作者： kane dmccer@gmail.com
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
 */
var path = require('path'),
    fs = require('fs'),
    watch = require('watch'),
    wrench = require('wrench'),
    _ = require('underscore'),
    next = require('next.js'),
    colorized = require('console-colorjs'),
    isHtmlFile,
    toJsFileName,
    parseHtml,
    writeToJsFile,
    writeAll,
    listenDir;

isHtmlFile = function (file) {
    return ['.html', '.htm'].indexOf(path.extname(file)) !== -1;
};

toJsFileName = function (file) {
    return path.join(
<<<<<<< HEAD
        path.dirname(file),
=======
        path.dirname(file), 
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
        path.basename(file).replace(/\.\w+$/, '') + '.js'
    );
};

parseHtml = function (html) {
    return JSON.stringify(html.replace(/\r/g, '').replace(/\n/g, '').replace(/>\s*</g, '><'));
};

writeToJsFile = function (file) {
    if (isHtmlFile(file)) {
        // read html/htm
        fs.readFile(file, 'utf8', function (err, data) {
            // write js file
            fs.writeFile(
<<<<<<< HEAD
                toJsFileName(file),
                'define(function () { return ' + parseHtml(data) + '; });',
                'utf8',
=======
                toJsFileName(file), 
                'define(function () { return ' + parseHtml(data) + '; });', 
                'utf8', 
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
                function (err) {
                    if (err) {
                        console.log(colorized.bright(err));
                    }
                }
            );

            console.log(file + colorized.bright(' 已转换成功'));
        });
<<<<<<< HEAD
    }
=======
    }   
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
};

writeAll = function (dir) {
    wrench.readdirRecursive(dir, function (err, curr) {
<<<<<<< HEAD
        if (curr) {
=======
        if (curr) {         
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
            _.each(curr, function (item) {
                var file = path.join(dir, item);

                fs.stat(file, function (err, stats) {
                    stats.isFile() && writeToJsFile(file);
                });
            });
        }
    });
};

listenDir = function (dir) {
    watch.createMonitor(dir, function (monitor) {

        var curRmfile = '';

<<<<<<< HEAD
        monitor.on('created', function (f) {
            writeToJsFile(f);
        });

        monitor.on('changed', function (f) {
            writeToJsFile(f);
        });

        monitor.on('removed', function (f) {
=======
        monitor.on('created', function (f, stat) {
            writeToJsFile(f);
        });

        monitor.on('changed', function (f, curr, prev) {
            writeToJsFile(f);
        });

        monitor.on('removed', function (f, stat) {
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
            var toRmFile;

            if (isHtmlFile(f)) {
                toRmFile = toJsFileName(f);

                if (curRmfile === toRmFile) {
                    curRmfile = '';
                    return;
                }

                curRmfile = toRmFile;

                fs.exists(toRmFile, function (exists) {
                    if (exists) {
                        fs.unlink(toRmFile, function (err) {
<<<<<<< HEAD
                            if (err) {
=======
                            if (err) { 
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
                                console.log(colorized.bright('删除文件失败: ') + '\n\r' + err);
                            }

                            console.log('删除文件 ' + colorized.bright(toRmFile) + ' 成功');
                        });
                    }
<<<<<<< HEAD
                });
            }
=======
                });         
            }           
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
        });
    });
}

module.exports = function (dir) {
    dir = path.resolve(dir);

    console.log('Watch执行的目录: ', colorized.bright(dir));
    
    next.pipe(
        function (callback) {
            writeAll(dir);
            callback();
        },
<<<<<<< HEAD
        function () {
=======
        function (callback) {
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
            listenDir(dir);
        }
    )(function (err) {
        console.log(colorized.bright(err));
<<<<<<< HEAD
    });
=======
    }); 
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
};