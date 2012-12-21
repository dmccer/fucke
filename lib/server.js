/**
 * 功能：
 *   启动一个指定端口的node服务器，
 *   为开发中提供服务器环境，
 *   此服务器提供目录列表功能，
 *   默认端口为3000 
 * 作者：Kane dmccer@gmail.com
 */

var http = require('http'),
    path = require('path'),
    connect = require('connect'),
    portfinder = require('portfinder'),
    colorized = require('console-colorjs');

module.exports = function (dir, port) {
    var dir = path.resolve(dir),
        app = connect()
            .use(connect.static(dir))
            .use(connect.directory(dir));

    portfinder.basePort = port || 3000;
    
    portfinder.getPort(function (err, port) {
        app.listen(port);
        console.log(colorized.bright('服务器启动成功，端口号：' + port));
    });
};

