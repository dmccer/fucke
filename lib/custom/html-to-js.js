var path = require('path'),
	fs = require('fs'),
	watch = require('watch'),
	colorized = require('console-colorjs'),	
	isHtmlFile,
	toJsFileName,
	parseHtml,
	writeToJsFile;

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

			console.log(colorized.bright(file) + ' compiled');
		});
	}	
};

module.exports = function (dir) {
	dir = path.resolve(dir);

	console.log('You watched the directory: ', colorized.bright(dir));

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
								console.log(colorized.bright(err));
							}

							console.log('remove ' + colorized.bright(toRmFile) + ' success');
						});
					}
				});			
			}			
		});
	});
};

module.exports('./');