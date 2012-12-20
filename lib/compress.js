var fs = require('fs'),
    path = require('path'),
    http = require('http'),
    exec = require('child_process').exec,

    _ = require('underscore'),
    next = require('next.js'),
    wrench = require('wrench'),    
    colorized = require('console-colorjs'),    
    parseUri = require('./parse-uri'),
    jsp = require("uglify-js").parser,
    pro = require("uglify-js").uglify,

    SEA_JS_CONFIG_KEY = './sea-config.js',
    // borrow from seajs
    REQUIRE_RE = /(?:^|[^.$])\brequire\s*\(\s*(["'])([^"'\s\)]+)\1\s*\)/g,
    Ast = {},

    parseDependencies,
    removeComments,
    generateCode;

global.seajs = {};

parseDependencies = function(code) {
    // Parse these `requires`:
    //   var a = require('a');
    //   someMethod(require('b'));
    //   require('c');
    //   ...
    // Doesn't parse:
    //   someInstance.require(...);
    var ret = [],
        match

        code = removeComments(code)
        REQUIRE_RE.lastIndex = 0

    while((match = REQUIRE_RE.exec(code))) {
        if(match[2]) {
            ret.push(match[2])
        }
    }

    return _.uniq(ret)
}

// See: research/remove-comments-safely
removeComments = function(code) {
    return code.replace(/^\s*\/\*[\s\S]*?\*\/\s*$/mg, '') // block comments
    .replace(/^\s*\/\/.*$/mg, '') // line comments
}
// end borrow from seajs

Ast.walk = function(ast, type, walker) {
    var w = pro.ast_walker();

    var walkers = {};
    walkers[type] = function() {
        walker(this);
    };

    ast = w.with_walkers(walkers, function() {
        return w.walk(ast);
    });

    return ast;
};

generateCode = function (ast, meta, options) {
    var times = 0;

    ast = Ast.walk(ast, 'stat', function(stat) {
        if(stat.toString().indexOf('stat,call,name,define,') !== 0) {
            return stat;
        }

        if(++times > 1) {
            // Found multiple "define" in one module file. Only handle the first one.
            return;
        }

        var id, deps;

        if(meta.id) {
            id = ['string', meta.id];
        }

        if(meta.deps) {
            deps = ['array', meta.deps.map(function(item) {
                return ['string', item];
            })];
        }

        // stat[1]:
        //     [ 'call',
        //       [ 'name', 'define' ],
        //       [ [ 'function', null, [Object], [Object] ] ] ]
        var args = stat[1][2];
        //console.log(args);
        // define(factory)
        if(args.length === 1 && deps) {
            args.unshift(deps);
        }

        if(args.length === 2) {
            var type = args[0][0];

            // define(id, factory)
            if(type === 'string' && deps) {
                var factory = args.pop();
                args.push(deps, factory);
            }
            // define(deps, factory)
            else if(type === 'array' && id) {
                args.unshift(id);
            }
        }

        return stat;
    });

    ast = pro.ast_mangle(ast, options);
    ast = pro.ast_squeeze(ast, options);
    return pro.gen_code(ast, options) + ';';
}

module.exports = function(bootstrapFilePath, appUrl, options) {
    var alias = {},
        fileContentsAll = [],
        parsedFile = {},
        count = 0,
        appUrlMappingPath,
        parseFile,
        timer,
        findSeaConfig;

    appUrlMappingPath = path.dirname(bootstrapFilePath);
    console.log('\tThe source dir: ', appUrlMappingPath)

    // 如果传入的路径是这个文件本身的话，则取这个文件的目录
    if(path.extname(appUrl)) {
        appUrl = path.dirname(appUrl)
        console.log('\tThe target dir: ', appUrl);
    }

    // var location = parseUri(appUrl);
    global.seajs.config = function(config) {
        _.extend(alias, config.alias);
        parseFile(path.basename(bootstrapFilePath));
    };

    // sea-config.js里面会有location这个对象，所以模拟出一个location的空对象出来，实际不会被用到
    global.location = {
        protocol: null,
        hostname: null,
        port: null
    };

    parseFile = function(relativeFilePath) {
        var filePath = path.join(appUrlMappingPath, relativeFilePath),
            urlPath,
            relativePath;

        if(path.extname(filePath) !== '.js') {
            filePath += '.js';
        }

        urlPath = path.join(appUrl, relativeFilePath).replace(/\\/g, '/');

        relativePath = path.dirname(relativeFilePath);

        if(parsedFile[urlPath]) {
            return;
        }

        parsedFile[urlPath] = true;
        console.log(filePath)

        // 有可能原路径是xxx.css，加上.js扩展名之后就不存在了。
        // 原先是直接判断路径的扩展名是否是js，不是的话，就不进入parseFilele
        // 后来发现，这样会把类似于knockout.mapping的文件名过滤掉。
        // 所以就放在这里判断了
        if(!fs.existsSync(filePath)) {
            return;
        }

        count++;

        next.pipe(

        function(callback) {
            fs.readFile(filePath, 'utf8', callback)
        }, function(str, callback) {
            var deps = parseDependencies(str);

            _.each(deps, function(dep) {
                var extname = path.extname(dep);
                // if (extname && extname !== '.js') {
                //     return;
                // }
                if(dep.indexOf('.') === 0) { //relative
                    parseFile(path.join(relativePath, dep));
                } else {
                    if(options.all) {
                        var modulePaths = dep.split('/');
                        var moduleName = modulePaths.shift();
                        var moduleRelativePath = modulePaths.length ? modulePaths.join('/') : '';


                        if(alias[moduleName]) {
                            parseFile(path.join(alias[moduleName], moduleRelativePath))
                        }
                    }
                }
            });


            var ast = jsp.parse(str);
            var code = generateCode(ast, {
                id: urlPath,
                deps: deps
            });

            fileContentsAll.push(code);
            count--;
        })(function(err) {
            console.log(err)
        });
    };

    timer = setInterval(function() {
        if(count === 0) {
            fs.writeFile(bootstrapFilePath.substring(0, bootstrapFilePath.length - 3) + '-min.js', fileContentsAll.join('\n'), 'utf8', function(err) {
                if(err) {
                    console.log(err)
                } else {
                    console.log('complete')
                }

            });
            clearInterval(timer)
        }
    }, 1000);


    findSeaConfig = function(dir) {
        var lastDir, seajsConfigPath;

        dir = path.resolve(dir);

        while(dir !== lastDir) {
            seajsConfigPath = path.join(dir, SEA_JS_CONFIG_KEY);

            console.log('\tThe sea-config path: ', seajsConfigPath);

            if(fs.existsSync(seajsConfigPath)) {
                require(seajsConfigPath);                
            } else {
                lastDir = dir;
                dir = path.join(dir, '../');
            }
        }

        parseFile(path.basename(bootstrapFilePath));
    };


    // run
    findSeaConfig(appUrlMappingPath);
};



