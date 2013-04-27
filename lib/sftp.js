/**
 * 上传文件到服务器 sftp协议
 * =======================
 *
 * 作者：[Kane](http://www.svger.com 'BLOG') <dmccer@gmail.com>
 *
 * 时间：*2013-4-27*
 *
 * TODO:
 * -----
 * 
 */
var path = require('path'),
	fs = require('fs'),
	Connection = require('ssh2'),
	async = require('async'),
	wrench = require('wrench'),
	uploadFilter = require('./upload-filter'),
    colorized = require('console-colorjs'),
    _ = require('underscore'),
    NL = '\n\r',
	sftp,
	ssh2Init

lsRmtdir = function (sftp, rmtdir, callback) {
	async.waterfall([
    	function (callback) {
    		sftp.opendir(rmtdir, callback)
    	},

    	function (handle, callback) {
    		var readdir = arguments.callee,
    			next = callback

    		sftp.readdir(handle, function (err, list) {
    			callback(err, list, readdir, handle, next)
    		})
    	},

    	function (list, readdir, handle, next, callback) {
    		if (list === false) {
    			sftp.close(handle, function (err) {
    				sftp.end()
    				console.log('SFTP handle 已关闭')
    			})
    		}

    		!list && (list = [])

    		callback(undefined, _.filter(list, function (item) {
                return _.indexOf(['.', '..'], item.filename) === -1 && item.attrs.isDirectory()
            }))

            return

            readdir(handle, next)
    	}
    ], function (err, dirs) {
    	if (err) {
    		throw err
    	}

		callback(dirs)
    })
}

lsRmtdirSyncRecursive = function (sftp, rmtdir, callback) {
	var timer,
		rmtdirSet = [],
		lsCount = 0,
		dirCount = 1,
		len = (rmtdir + path.sep).length

	_lsRmtdir = function (dir) {
		lsRmtdir(sftp, dir, function (_dirs) {
			var l = _dirs.length
			
			dirCount += l

			if (l > 0) {
				rmtdirSet = _.union(rmtdirSet, _.map(_dirs, function (item) {
					return path.join(dir.substr(len), item.filename)
				}))

				_.each(_dirs, function (item) {
					_lsRmtdir(path.join(dir, item.filename))
				})
			}

			lsCount++
		})
	}

	_lsRmtdir(rmtdir)

	timer = setInterval(function () {
		if (lsCount === dirCount) {
			clearInterval(timer)
			callback(rmtdirSet)
		}
	}, 100)
}

getSftp = function (c, callback) {
	async.waterfall([
    	function (callback) {
    		c.sftp(callback)
    	}
    ], function (err, sftp) {
    	if (err) {
    		throw err
    	}

    	sftp.on('end', function () {
			console.log('SFTP会话已关闭')
		})

		callback(sftp)
    })
}

mkRmtdir = function (sftp, rmtdir, callback) {
	async.waterfall([
    	function (callback) {
    		sftp.mkdir(rmtdir, callback)
    	}
    ], function (err) {
    	if (err) {
    		throw err
    	}

    	console.log('创建服务器目录' + rmtdir + '成功！')

    	callback()
    })
}

mkdirSyncRecursive = function (sftp, dirs, root, callback) {
	var _mkdir,
		timer,
		_dirs = _.extend([], dirs),
		len = (root + path.sep).length

	_mkdir = function (dir) {
		var l;

		mkRmtdir(sftp, dir, function () {
			_dirs = _.without(_dirs, dir.substr(len))

			l = _dirs.length

			if (l > 0) {
				_mkdir(path.join(root, _dirs[l-1]))
			}
		})
	}

	if (_dirs.length > 0) {
		_mkdir(path.join(root, _dirs[_dirs.length - 1]))
	}

	timer = setInterval(function () {
		var l = _dirs.length

		if (l === 0) {
            clearInterval(timer);
            callback();
        }
	}, 100)
}

mkfile = function (sftp, locfile, rmtfile, callback) {
	async.waterfall([
    	function (callback) {
    		sftp.fastPut(locfile, rmtfile, callback)
    	}
    ], function (err) {
    	if (err) {
    		throw err
    	}

    	console.log('创建服务器文件' + rmtfile + '成功！')

    	callback()
    })
}

mkfileSyncRecursive = function (sftp, files, locroot, rmtroot, callback) {
	var _mkfile,
		timer,
		_files = _.extend([], files),
		len = (locroot + path.sep).length,
		_l = _files.length

	_mkfile = function (locfile, rmtfile) {
		var l;

		mkfile(sftp, locfile, rmtfile, function () {
			_files = _.without(_files, locfile.substr(len))

			l = _files.length

			if (l > 0) {
				_mkfile(path.join(locroot, _files[l-1]), path.join(rmtroot, _files[l-1]))
			}
		})
	}

	if (_l > 0) {
		_mkfile(path.join(locroot, _files[_l-1]), path.join(rmtroot, _files[_l-1]))
	}

	timer = setInterval(function () {
		var l = _files.length

		if (l === 0) {
            clearInterval(timer);
            callback();
        }
	}, 100)
}

ssh2Init = function (env) {
    var c = new Connection()

    console.log('....')

    c.on('connect', function () {
        console.log('连接服务器...');
    });

    c.on('ready', function () {
        console.log('服务器连接成功，已准备就绪')

        var sftp

        async.waterfall([
        	// 获取sftp对象
        	function (callback) {
        		getSftp(c, function (_sftp) {
        			sftp = _sftp
        			callback(undefined, _sftp)
        		})
        	},

        	// 获取服务器根目录下的所有应用程序目录
        	function (sftp, callback) {
        		lsRmtdir(sftp, env.root, function (dirs) {
		        	callback(undefined, dirs)
		        })
        	},

        	// 判断服务器上是否存在应用程序目录
        	function (dirs, callback) {
        		var dirnames = _.map(dirs, function (item) {
        			return item.filename
        		})

        		callback(undefined, _.indexOf(dirnames, env.appName) !== -1)
        	},

        	// 在服务器上创建应用程序目录
        	function (mode, callback) {
        		if (!mode) {
	        		mkRmtdir(sftp, env.remotePath, callback)
	        	} else {
	        		callback()
	        	}
        	},

        	// 上传指定文件
        	function (callback) {
        		var dirContents, dirSet, fileSet, dir = env.locPath

				// 获取需要上传的目录下所有文件
				dirContents = wrench.readdirSyncRecursive(dir);

				// 根据指定方式过滤文件和文件夹
				dirContents = uploadFilter(dir, dirContents);

				// 过滤配置文件中指定的文件
				if (env.ignore) {
				    dirContents = _.difference(dirContents, env.ignore);
				}

				// 过滤出需要上传的目录
				dirSet = _.filter(dirContents, function (item) {
				    var loc = path.join(dir, item),
				        stats = fs.statSync(loc);

				    return stats.isDirectory();
				});

				// 根据目录路径排序，确认目录的层级，长度越短的层级越浅
				dirSet.sort(function (a, b) {
				    var numA = a.length - a.replace(/(\/)|(\\)/g, '').length,
				        numB = a.length - b.replace(/(\/)|(\\)/g, '').length;

				    return numA - numB;
				});

				// 忽略掉所有需要上传的目录，过滤出所有需要上传的文件
				fileSet = _.difference(dirContents, dirSet);

				lsRmtdirSyncRecursive(sftp, env.remotePath, function (dirs) {
					dirSet = _.difference(dirSet, dirs)
					mkdirSyncRecursive(sftp, dirSet, env.remotePath, function () {
						console.log(NL + colorized.bright('目录创建成功') + NL)
						mkfileSyncRecursive(sftp, fileSet, path.resolve(env.locPath), env.remotePath, function () {
							console.log(NL + colorized.bright('文件创建成功') + NL)
							sftp.end()
							c.end()
						})
					})
		        })
        	}
        ], function (err, result) {
        	
        })
        
    });

    c.on('error', function (err) {
        console.log('服务器连接出错：' + NL + err);
    });

    c.on('end', function () {
        console.log('服务器连接结束！');
    });

    c.on('close', function (had_error) {
        console.log('服务器连接已关闭！');
    });

    c.connect({
        host: env.server.host,
        port: 22,
        username: env.server.user,
        password: env.server.pass
    });
};

module.exports = function (rmtDir) {
	ssh2Init(rmtDir)
}

