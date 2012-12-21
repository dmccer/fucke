/**
 * 功能：监控指定目录下的html/htm文件，将其转换为seajs模式的js文件
 * 作者： kane dmccer@gmail.com
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
        path.dirname(file), 
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
                toJsFileName(file), 
                'define(function () { return ' + parseHtml(data) + '; });', 
                'utf8', 
                function (err) {
                    if (err) {
                        console.log(colorized.bright(err));
                    }
                }
            );

            console.log(file + colorized.bright(' 已转换成功'));
        });
    }   
};

writeAll = function (dir) {
    wrench.readdirRecursive(dir, function (err, curr) {
        if (curr) {         
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

        monitor.on('created', function (f, stat) {
            writeToJsFile(f);
        });

        monitor.on('changed', function (f, curr, prev) {
            writeToJsFile(f);
        });

        monitor.on('removed', function (f, stat) {
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
                            if (err) { 
                                console.log(colorized.bright('删除文件失败: ') + '\n\r' + err);
                            }

                            console.log('删除文件 ' + colorized.bright(toRmFile) + ' 成功');
                        });
                    }
                });         
            }           
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
        function (callback) {
            listenDir(dir);
        }
    )(function (err) {
        console.log(colorized.bright(err));
    }); 
};