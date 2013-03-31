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
    cleanCSS = require('clean-css'),

    SEA_JS_CONFIG_KEY = './sea-config.js',
    // borrow from seajs
    REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g,
    // 上面正则导致sublime高亮失效 所以这里必须在后面加个双引号 " 
    
    SLASH_RE = /\\\\/g,

    Ast = {},

    parseDependencies,
    removeRequireCSS,
    removeComments,
    removeDepCss,
    generateCode;

global.seajs = {};

removeRequireCSS = function(str) {
    return str.replace(REQUIRE_RE, function(m, m0, m1, m2) {
        if (path.extname(m1) === '.css') {           
            return m.replace(/require\([^\)]*\)/g, '');
        } else {
            return m
        }
    });
};

parseDependencies = function(code) {
    // Parse these `requires`:
    //   var a = require('a');
    //   someMethod(require('b'));
    //   require('c');
    //   ...
    // Doesn't parse:
    //   someInstance.require(...);
    var ret = [], m
    REQUIRE_RE.lastIndex = 0
    code = code.replace(SLASH_RE, '')

    while ((m = REQUIRE_RE.exec(code))) {
      if (m[2]) ret.push(m[2])
    }

    return _.uniq(ret)
}

removeDepCss = function(deps) {
    return deps.filter(function(o) {
        return path.extname(o) !== '.css';
    })
};

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
        notExists = [],
        cssContent = '',
        parsedFile = {},
        count = 0,
        running = 0,
        appUrlMappingPath,
        bootstrapFilePathBaseName,
        parseFile,
        parseCss,
        timer,
        findSeaConfig;

    appUrlMappingPath = path.dirname(bootstrapFilePath);
    bootstrapFilePathBaseName = path.basename(bootstrapFilePath);

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

    parseCss = function(filePath, relativeFilePath) {
        fs.readFile(filePath, 'utf8', function(err, content) {
            running--;
            if (err) {
                console.log('读取css失败："' + filePath + '"');
            } else {
                // console.log()
                content = content
                    // 替换成相对路径
                    .replace(/url\((.*)\)/g, function(m, url) {
                        url = url.replace(/["']/g, '');
                        if (url.indexOf('http') === 0) {
                            return m;
                        }
                        return 'url(' + (url.indexOf('http') === 0 ? url: path.join(path.dirname(relativeFilePath), url).replace(/\\/g, '/')) + ')'
                    })

                    // 去掉 @charset
                    .replace(/^@charset.*(?:$|;)/mg, '')

                    // 把@import 提前
                    .replace(/^@import.*(?:$|;)/mg, function(m) {
                        cssContent = m + cssContent;
                        return '';
                    }) + '\n';


                cssContent += content;
            }
        });
    };

    parseFile = function(relativeFilePath) {
        var filePath = path.join(appUrlMappingPath, relativeFilePath),
            isRoot = bootstrapFilePathBaseName === relativeFilePath,
            urlPath,
            relativePath,
            extname;

        extname = path.extname(filePath)

        if (['.js', '.css'].indexOf(extname) === -1) {            
            filePath += '.js';
        }

        urlPath = path.join(appUrl, relativeFilePath).replace(/\\/g, '/');

        // 如果传入的是完整的http url的话，path.join会把http:// 变成 http:/ 所以这里要变回来
        if (appUrl.indexOf('http://') === 0) {
            urlPath = urlPath.replace('http:/', 'http://');
        }

        // 去掉.js
        // 不能用 /\.[^.]$/  因为文件名后面可能有. 比如  knockout.mapping.debug
        urlPath = urlPath.replace(/\.js$/, '');

        if (urlPath.indexOf('json!') !== -1) {
            return;
        }

        if (parsedFile[urlPath]) {
            return;
        }
        parsedFile[urlPath] = true;  

        relativePath = path.dirname(relativeFilePath);
        // console.log(filePath)

        // 有可能原路径是xxx.css，加上.js扩展名之后就不存在了。
        // 原先是直接判断路径的扩展名是否是js，不是的话，就不进入parseFilele
        // 后来发现，这样会把类似于knockout.mapping的文件名过滤掉。
        // 所以就放在这里判断了
        if(!fs.existsSync(filePath)) {
            notExists.push(path.resolve(filePath));
            return;
        }

        console.log(filePath)

        running++;
        count++;

        if (extname === '.css') {
            parseCss(filePath, relativeFilePath);
            return;
        }

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

            str = removeRequireCSS(str);

            var ast = jsp.parse(str);
            var _deps = removeDepCss(deps);

            if (isRoot) {
                _deps.push('./' + path.basename(bootstrapFilePath, '.js') + '-min.css')
            }
                

            var code = generateCode(ast, {
                id: urlPath,
                deps: _deps
            });

            fileContentsAll.push(code);
            running--;
        })(function(err) {
            console.log(err)
        });
    };

    timer = setInterval(function() {
        var toDelFiles = [
            '/src/config/enum-config',
            '/src/config/site-config',
            '/src/config/administrator'
        ];

        if (running === 0) {
            console.log('packaged ' + colorized.bright(count) + ' files')

            var cssFileName = bootstrapFilePath.substring(0, bootstrapFilePath.length - 3) + '-min.css';
            
            fs.writeFile(cssFileName, cleanCSS.process(cssContent, {
                keepSpecialComments: 0,
                keepBreaks: true
            }), 'utf8', function(err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(colorized.bright(cssFileName) + ' is created');
                }
            })
            var jsFileName = bootstrapFilePath.substring(0, bootstrapFilePath.length - 3) + '-min.js';

            fileContentsAll = _.filter(fileContentsAll, function (content) {
                return _.all(toDelFiles, function (flag) { return content.indexOf(flag) === -1; });
            });

            fs.writeFile(jsFileName, fileContentsAll.join('\n'), 'utf8', function(err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(colorized.bright(jsFileName) + ' is created');
                    if (notExists.length) {
                       console.log('following files are not exists:\n', notExists.join('\n')) 
                    }
                }
                
            });
            clearInterval(timer)
        }

        // if(count === 0) {
        //     fs.writeFile(bootstrapFilePath.substring(0, bootstrapFilePath.length - 3) + '-min.js', fileContentsAll.join('\n'), 'utf8', function(err) {
        //         if(err) {
        //             console.log(err)
        //         } else {
        //             console.log('complete')
        //         }

        //     });
        //     clearInterval(timer)
        // }
    }, 1000);


    findSeaConfig = function(dir) {
        var lastDir, seajsConfigPath;

        dir = path.resolve(dir);

        while(dir !== lastDir) {
            seajsConfigPath = path.join(dir, SEA_JS_CONFIG_KEY);

            if(fs.existsSync(seajsConfigPath)) {                
                require(seajsConfigPath);
                break;
            } else {
                lastDir = dir;
                dir = path.join(dir, '../');
            }
        }

        console.log('\tThe sea-config path: ', seajsConfigPath);

        parseFile(path.basename(bootstrapFilePath));
    };

    // run
    findSeaConfig(appUrlMappingPath);
};



