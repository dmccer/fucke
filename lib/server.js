/**
<<<<<<< HEAD
 * Node Server Starter
 * ===================
 *
 * 作者 [Kane](http://www.svger.com 'BLOG') <dmccer@gmail.com>
 *
 * 时间：*2012-12-25*
 *
 * 功能
 * ----
 * 1. 启动一个指定端口的node服务器；
 * 2. 为开发中提供服务器环境；
 * 3. 此服务器提供目录列表功能；
 * 4. 默认端口为3000。
 *
 * TODO
 * ----
 * 1. 接收POST请求，并返回相应的值；
 * 2. HTTP头可配置（缓存、gzip、cookie等）
 * 
 */

var path = require('path'),
    connect = require('connect'),
    portfinder = require('portfinder'),
    colorized = require('console-colorjs'),
    http = require('http');

module.exports = function (dir, port) {
    var app;

    dir = path.resolve(dir);
    app = connect()
        .use(connect.static(dir))
        .use(connect.directory(dir));
=======
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
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8

    portfinder.basePort = port || 3000;
    
    portfinder.getPort(function (err, port) {
<<<<<<< HEAD
        // app.listen(port);
        
        http.createServer(app).listen(port);        
=======
        app.listen(port);
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
        console.log(colorized.bright('服务器启动成功，端口号：' + port));
    });
};

