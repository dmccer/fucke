var fs = require('fs');
var path = require('path');
var next = require('next.js');
var wrench = require('wrench');
var _ = require('underscore');
var exec = require('child_process').exec;
var colorized = require('console-colorjs');
var http = require('http');
var q = require('q');
var initProj = require('./init-project');
// var repoConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'all-modules.json'), 'utf-8'));

var promiseAllModules = require('./remote-file-promise')(require('./config').moduleConfigUrl).then(function(str) {
    return JSON.parse(str);
});

var readPackageJSON = next.pipe(
    function(modulePath, callback) {
        var packageJSONPath = path.join(modulePath, 'package.json');
        fs.readFile(path.join(packageJSONPath), 'utf-8', callback);
    },
    function(str, callback) {
        try {
            callback(null, JSON.parse(str) || {});
        } catch (e) {
            callback(e);
        }            
    }
);

var isModulePath = function(_path) {
    return fs.existsSync(path.join(_path, 'package.json'));
};

var install = function(modulePath, callback) {
    if (!isModulePath(modulePath)) {
        callback();
        return;
    }

    var projectPath = path.join(modulePath, '../');

    next.pipe(

        readPackageJSON,

        // parse config
        function(config, callback) {
            var dependencies = config.dependencies;

            if (!dependencies) {
                callback();
                return;
            }

            var modules = Object.keys(dependencies);

            var alias = {};

            var setAlias = function(moduleName, _modulePath, callback) {
                next.pipe(

                    readPackageJSON,

                    function(config, callback) {
                        // var main = config.main || './src/index';
                        _setAlias(moduleName, config.main || '')
                        callback()
                    }

                )(_modulePath, callback);
            };

            var _setAlias = function(moduleName, main) {     
                 // replace // for win           
                 alias[moduleName] = path.join(moduleName, main).replace(/\\/g, '/');
            };

            next.pipe( // modules

                // load from git if need
                next.map(      
                    next.pipe(
                        function(moduleName, callback) {
                   
                            var _modulePath = path.join(projectPath, moduleName); 

                            if (fs.existsSync(_modulePath)) {
                                callback();
                                return;
                            } 

                            promiseAllModules.then(function(repoConfig) {
                                var moduleConfig = repoConfig[moduleName];

                                if (!moduleConfig) {
                                    callback('module:' + moduleName + ' not exists');
                                    return;
                                }
                                
                                var gitCommand = 'git clone ' + moduleConfig.git + ' ' + _modulePath;
                                console.log(gitCommand);
                               
                                exec(gitCommand, function(mayError) {
                                    callback(mayError);
                                });
                            });                            
                        }
                    ) 
                ),
                
                // set sea-config.js
                function(results, callback) {
                    next.pipe(
                        function(callback) {
                            fs.readdir(projectPath, callback);
                        },

                        function(files, callback) {
                            next.map(
                                function(moduleName, callback) {
                                    var packageJSONPath = path.join(projectPath, moduleName, 'package.json');
                                    if (fs.existsSync(packageJSONPath)) {
                                        setAlias(moduleName, path.join(projectPath, moduleName), callback);
                                    } else {
                                        _setAlias(moduleName);
                                        callback();
                                    }
                                }
                            )(
                                files,
                                callback
                            );
                        }
                        
                    )(callback);                    
                },          

                function(results, callback) {
                    var _alias = {};
                    _.each(alias, function(url, key) {
                        if (key !== 'seajs') {
                            _alias[key] = 'seajs/../../../' + url;
                        }
                    });

                    var filePath = path.join(modulePath, 'sea-config.js');

                    if (!fs.existsSync(filePath)) {
                        fs.writeFile(
                            filePath,
                            'seajs.config(\n\n' + JSON.stringify({
                                debug: 2,
                                // preload: ['plugin-text'],
                                alias:_alias
                            }, null, 4) + '\n\n)',
                            'utf-8',
                            callback
                        );
                    }
                }
            )(modules, callback)
        }
    )(modulePath, callback);
};

var cloneRepo = function(moduleName, gitPath, callback) {
    next.pipe(
        function(callback) {
            fs.mkdir(moduleName, callback)
        },
        function(callback) {
            var gitCommand = 'git clone ' + gitPath;
            console.log(gitCommand);
           
            exec(gitCommand, function(mayError) {
                callback(mayError);
            });
        }
    )(callback);    
};

var fetchDenpendencies = function(modulePath) {
    next.pipe(
        function(callback) {
            install(modulePath, callback)
        },
        function(callback) {
            console.log('install complete');
        }
    )(function() {
        console.log(arguments)
    });
};

// install exist_module
// install dependancies

module.exports = function(pathOrModuleName) {   
    var callback = function(e) {
        console.log(e || 'install ' + colorized.cyan(pathOrModuleName) + ' complete');
    };

    if (fs.existsSync(pathOrModuleName)) {
        fetchDenpendencies(pathOrModuleName);
    } else {
        promiseAllModules.then(function(allModules) {
            if (allModules[pathOrModuleName]) {
                cloneRepo(pathOrModuleName, allModules[pathOrModuleName].git, function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        fetchDenpendencies(pathOrModuleName);
                    }
                });
            } else {
                initProj(pathOrModuleName);
                fetchDenpendencies(pathOrModuleName);
            }
        });
    }
};

if (require.main === module) {
    var modulePath = process.argv[2];
    if (modulePath) {
        module.exports(modulePath);
    }
}




