var cleanCss = require('clean-css'),
	fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	compress, findCss;

compress = function (p) {
	fs.readFile(p, 'utf8', function (err, data) {
		var min = '';

		if (err) { throw err; }

		min = cleanCss.process(data);

		fs.writeFileSync(path.basename(p, '.css') + '-min.css', min, 'utf8');
	});
};

findCss = function (p, t) {
	var dir = path.resolve(p),
		tdir = path.resolve(p), 
		min = '', 
		csses = '', 
		isLastFile = false,
		fileCount = 0,
		readdir, 
		replaceUrl;

	replaceUrl = function (s, root, curPath) {
		var netUrlReg = /http:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/, 
			isNetUrl = netUrlReg.test(s);
		
		console.log(path.relative(root, curPath));

		if(isNetUrl) {
			return s;
		} else {						
			return 'url(\'' + 
				path.relative(root, curPath).replace(/\\/g, '/').replace(/\/$/, '') + 
				'/' 
				+ s.replace(/'|"/g, '').replace(/^\//g, '') + '\')';
		}
	};

	readdir = function (p) {
		fs.readdir(p, function (err, files) {
			var cssFiles;

			if(err) {
				throw err;
			}

			_.each(files, function (f) {
				var subPath = path.join(p, f);
				
				if(fs.statSync(subPath).isDirectory()) {					
					readdir(subPath);
				}
			});

			cssFiles = _.filter(files, function (f) {
				var cssMinFileReg = /-min\.css/g;

				if(path.extname(f) === '.css' && !cssMinFileReg.test(f)) {
					return true;
				}
			});

			_.each(cssFiles, function (f) {
				var urlReg = /url\(([^\(\)]+)\)/gi,
					content = fs.readFileSync(path.join(p, f), 'utf8'),
					rs;

				rs = content.replace(urlReg, function () {
					return replaceUrl(arguments[1], tdir, p);
				});

				csses += '\n\r' + rs;
			});			
		});
	};

	readdir(dir);

	setTimeout(function () {
		if(csses) {
			console.log('压缩合并成功！');
		}
		min = cleanCss.process(csses, {keepSpecialComments: 0, removeEmpty: true});
		fs.writeFileSync(t, min, 'utf8');
	}, 1000);	
};

module.exports = findCss;
