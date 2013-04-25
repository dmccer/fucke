<<<<<<< HEAD
/*
 * 文件上传过滤器
 * ==============
 *
 * 作者 [Kane](http://www.svger.com 'BLOG') <dmccer@gmail.com>
 *
 * 时间：*2012-12-28*
 *
 * 过滤规则
 * --------
 * 1. 从原始文件和目录中过滤掉不需要的;
 * 2. 从第一步结果集中选择需要的。
 *
 * TODO
 * ----
 * 1. 抽象公共规则；
 * 2. 提供扩展规则可配置；
 * 3. 规则可自定义并自动被调用。
 * 
 */
var path = require('path'),
	fs = require('fs'),
	_ = require('underscore'),
	isIgnored,
	ignore,
	onlineToUpload;

/**
 * filter
 * ---
 * 参数信息：
 *   - dir string 本地需要上传的目录
 *   - dirContents [string] 所有需要上传的文件和目录的集合
 */
module.exports = function (dir, dirContents) {
	var ret = [], afterIgnore;

    afterIgnore = ignore(dir, dirContents);
    ret = onlineToUpload(dir, afterIgnore);

    console.log(ret)
	return ret;
};

isIgnored = function (file) {
    var stats,
        result = true,
        dirIgnore = [
            '.git',
            '.',
            'docs',
            'test'
        ],
        filePass = [
            // '.html',
            // '.htm',
            '.js',
            '.css',
            '.swf',
            '.png',
            '.gif',
            '.jpg'
        ];


    if (fs.existsSync(file)) {
        stats = fs.statSync(file);

        if (stats.isFile()) {
            result = filePass.indexOf(path.extname(file)) === -1;
        } else if (stats.isDirectory()) {
            result = dirIgnore.indexOf(path.basename(file)) !== -1;
        }
    }

    if (!result) {
        result = _.some(dirIgnore, function (item) {
            var rootDir = path.sep + item + path.sep,
                subDir = path.sep + item,
                sIndex = file.length - subDir.length - 1;

            return file.indexOf(rootDir) !== -1 || file.indexOf(subDir) === sIndex;
        });
    }

    return result;
};

ignore = function (dir, dirContents) {
    var toUpload;

    toUpload = _.filter(dirContents, function (file) {
        return !isIgnored(path.join(dir, file));
    });

    return toUpload;
};

onlineToUpload = function (dir, dirContents) {    
    var res = [
            '.swf',
            '.png',
            '.gif',
            '.jpg'
        ],
        code = [
            '-min.css',
            '-min.js',
            'css3-mediaqueries.js',
            'sea-config.js',
            'sea.js',
            'plugin-text.js',
            'plugin-json',
            'plugin-base',
            'fontawesome-webfont.eot',
            'fontawesome-webfont.svg',
            'fontawesome-webfont.ttf',
            'fontawesome-webfont.woff',
            'FontAwesome.otf'
        ],
        allToUpload = [],
        li = 0,
        lj = 0,
        ai,
        aj,
        resToUpload,
        removedRes,
        codeToUpload;

    resToUpload = _.filter(dirContents, function (file) {
        return res.indexOf(path.extname(file)) !== -1;
    });

    removedRes = _.difference(dirContents, resToUpload);

    codeToUpload = _.filter(removedRes, function (file) {
        return !!(_.filter(code, function (item) {
            return path.basename(file).indexOf(item) !== -1;
        }).length);
    });

    ai = _.difference(removedRes, codeToUpload);
    aj = _.extend([], resToUpload, codeToUpload);
    
    li = ai.length;
    lj = aj.length;

    allToUpload = _.filter(ai, function (item) {
        return _.some(aj, function (file) {
            return file.indexOf(item) === 0;
        });
    });

    allToUpload = _.union(_.uniq(allToUpload), aj);

    return allToUpload;
=======
/*
 * 文件上传过滤器
 * ---
 * 过滤规则
 *   1. 从原始文件和目录中过滤掉不需要的;
 *   2. 从第一步结果集中选择需要的。
 */
var path = require('path'),
	fs = require('fs'),
	os = require('os'),
	_ = require('underscore'),
	isIgnored,
	ignore,
	onlineToUpload;

/**
 * filter
 * ---
 * 参数信息：
 *   - dir string 本地需要上传的目录 
 *   - dirContents [string] 所有需要上传的文件和目录的集合
 */
module.exports = function (dir, dirContents) {
	var ret = [], afterIgnore;

    afterIgnore = ignore(dir, dirContents);
    ret = onlineToUpload(dir, afterIgnore);

	return ret;
};

isIgnored = function (file) {
    var stats,
        result = true,
        dirIgnore = [
            '.git',
            '.',
            'docs',
            'test'
        ],
        filePass = [
            // '.html',
            // '.htm',
            '.js',
            '.css',
            '.swf',
            '.png',
            '.gif',
            '.jpg'
        ];


    if (fs.existsSync(file)) {
        stats = fs.statSync(file);

        if (stats.isFile()) {
            result = filePass.indexOf(path.extname(file)) === -1;
        } else if (stats.isDirectory()) {
            result = dirIgnore.indexOf(path.basename(file)) !== -1;
        }
    }

    if (!result) {
        result = _.some(dirIgnore, function (item) {
            var rootDir = path.sep + item + path.sep,
                subDir = path.sep + item,
                sIndex = file.length - subDir.length - 1;

            return file.indexOf(rootDir) !== -1 || file.indexOf(subDir) === sIndex;
        });
    }

    return result;
};

ignore = function (dir, dirContents) {
    var toUpload;

    toUpload = _.filter(dirContents, function (file) {
        return !isIgnored(path.join(dir, file));
    });

    return toUpload;
};

onlineToUpload = function (dir, dirContents) {
    var res = [
            '.swf',
            '.png',
            '.gif',
            '.jpg'
        ],
        code = [
            '-min.css',
            '-min.js',
            'css3-mediaqueries.js',
            'sea.js',
            'plugin-text.js',
            'plugin-json',
            'plugin-base',
            'sea-config.js'
        ],
        allToUpload = [],
        li = 0,
        lj = 0,
        ai,
        aj,
        resToUpload,
        removedRes,
        codeToUpload;

    resToUpload = _.filter(dirContents, function (file) {
        return res.indexOf(path.extname(file)) !== -1;
    });

    removedRes = _.difference(dirContents, resToUpload);

    codeToUpload = _.filter(removedRes, function (file) {
        return !!(_.filter(code, function (item) {
            return path.basename(file).indexOf(item) !== -1;
        }).length);
    });

    ai = _.difference(removedRes, codeToUpload);
    aj = _.extend([], resToUpload, codeToUpload);
    
    li = ai.length;
    lj = aj.length;

    allToUpload = _.filter(ai, function (item) {
        return _.some(aj, function (file) {
            return file.indexOf(item) === 0;
        });
    });

    allToUpload = _.union(_.uniq(allToUpload), aj);

    return allToUpload;
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
};