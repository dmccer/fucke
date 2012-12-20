var connect = require('connect')
  , http = require('http');

var cl = require('console-colorjs'); 
var getPort = require('portfinder').getPort;
var path = require('path');


module.exports = function(dir, port) {
    dir = path.resolve(dir);

    var app = connect()
    .use(connect.directory(dir))
    .use(connect.static(dir));

    (function(start) {
        if (port) {
            start(null, port);
        } else {
            getPort({
                port: 3000
            }, start);
        }
    })(function(err, port) {
        if (err) {
            console.log(err);
            return;
        }
        http.createServer(app).listen(port);
        console.log('start server for "' + dir + '" as "localhost/" at ' + cl.bright(port));
    });
};
