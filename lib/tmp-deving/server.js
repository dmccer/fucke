/**
 * server of node
 * ---
 * default port is 3000
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
		console.log('Server start at ' + colorized.bright(port));
	});
};

module.exports('./');

