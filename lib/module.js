<<<<<<< HEAD
var path = require('path'),
    _ = require('underscore'),
    fs = require('fs'),
    wrench = require('wrench'),
    colorized = require('console-colorjs'),
    w = require('./callback-wrapper');
=======
var path = require('path')
var _ = require('underscore');
var fs = require('fs');
var wrench = require('wrench');
var colorized = require('console-colorjs');
var w = require('./callback-wrapper');
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8

_.templateSettings = {
  interpolate : /\{\{(.+?)\}\}/g
};

<<<<<<< HEAD
console.log('err')

=======
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
// 实际目录 -> module.json
var createDirTree = function(dir, moduleConfig, callback) {
    var reading = 0;

    var readdir = function(dir, o) {
        reading += 1;
        fs.readdir(dir, function(err, files) {
            reading -= 1;
            if (err) {
                console.log(err)
            } else {
                files.forEach(function(file) {
                    var subPath = path.join(dir, file);
                    if (fs.statSync(subPath).isDirectory()) {
                        if (!o[file]) {
                            o[file] = {};
                        }
                        readdir(subPath, o[file]);
                    }
                })
            }
        })
    }

    readdir(dir, moduleConfig);

    var timer = setInterval(function() {
        if (reading === 0) {
            callback(moduleConfig)
            clearInterval(timer);
        }
    }, 60);
};

// module.json -> 实际目录
var createModuleFromTree = function(dir, moduleConfig, callback) {

    var createModule = function(dir, o) {
        var hasSub = false;
        _.each(o, function(sub, subDir) {
            hasSub = true;
            createModule(path.join(dir, subDir), sub);
        });
        if (!hasSub) {
            copyModuleFiles(dir);
        }
    };

    createModule(dir, moduleConfig);

    callback();    
};

var MODULE_FILE_PATH = path.join(__dirname, '../dpm_module_template');

var copyModuleFiles = function(dir) {
    if (!fs.existsSync(dir)) {
        wrench.mkdirSyncRecursive(dir, '0755');
    }
    if (!fs.statSync(dir).isDirectory()) {
<<<<<<< HEAD
        console.log('path:' + colorized.bright(dir) + colorized.bright(' 已经存在, 且不是目录'));
=======
        console.log('path:' + colorized.bright(dir) + ' 已经存在, 且不是目录');
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
        return;
    }


    w(fs.readdir, [dir], function(files) {
        if (!files.length) {
            var parts = dir.split(path.sep);
            var moduleName = parts[parts.length - 1];

            w(fs.readdir, [MODULE_FILE_PATH], function(files) {
                files.forEach(function(file) {
<<<<<<< HEAD
                    w(fs.readFile, [path.join(MODULE_FILE_PATH, file), 'utf8'], function(str) {                        
                        w(fs.writeFile, [
                            path.join(dir, _.template(file)({ module: moduleName })),
                            _.template(str)({
                                module: moduleName
                            }),
                            'utf8'
                        ]);
=======
                    w(fs.readFile, [path.join(MODULE_FILE_PATH, file), 'utf8'], function(str) {
                        w(fs.writeFile, [path.join(dir, file), _.template(str)({
                            module: moduleName
                        }), 'utf8']);
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
                    });
                });
            });

<<<<<<< HEAD
            console.log(colorized.bright('模块:') + dir + colorized.bright(' 已新增'));
=======
            console.log('模块:' + dir + ' 已新增')
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8


            // wrench.copyDirSyncRecursive(MODULE_FILE_PATH, dir);
            // w(fs.readdir, [dir], function(files) {
            //     files.forEach(function(file) {
            //         fs.renameSync(path.join(dir, file), path.join(dir, moduleName + '-' + file))
            //     });
            // });
        }
    })
};

var REQUIRE_TEMPLATE = _.template('require({{path}})')

var createIncludeFile = function(dir) {
    var includeFilePath = path.join(dir, 'include-all.js');

    if (fs.existsSync(includeFilePath)) {
        fs.unlinkSync(includeFilePath);
    }

    var code = wrench.readdirSyncRecursive(dir).filter(function(file) {
        return path.extname(file) === '.js';
    }).map(function(file) {
        return 'require(\'./' + file.replace(/\\/g, '/') +  '\');';
    }).join('\n    ');


    code = 'define(function(require){\n    ' + code + '\n});'

    fs.writeFileSync(includeFilePath, code, 'utf8');       
};

var DEFAULT_OPTIONS = {
    file: 'modules.json'
}

exports.sync = function(dir, options) {
    if (options.templates) {
        MODULE_FILE_PATH = options.templates;
    } else {
        MODULE_FILE_PATH = path.join(dir, '../module_templates');
    }

<<<<<<< HEAD
    console.log(colorized.bright('模版路径:') + path.resolve(MODULE_FILE_PATH));
=======
    console.log('模版路径:' + path.resolve(MODULE_FILE_PATH));
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8

    _.defaults(options, DEFAULT_OPTIONS);
    dir = path.resolve(dir);

    var configFilePath = path.join(dir, options.file);
    var moduleConfig

    if (fs.existsSync(configFilePath)) {
        moduleConfig = require(configFilePath);
    } else {
        moduleConfig = {};
    }

    createDirTree(dir, moduleConfig, function() {
        fs.writeFileSync(configFilePath, JSON.stringify(moduleConfig, null, '    '), 'utf8');  
        createIncludeFile(dir);
        createModuleFromTree(dir, moduleConfig, function() {
<<<<<<< HEAD
            console.log(colorized.bright('模块初始化完成！'));
=======
            console.log('complete');
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
        });
    });
};