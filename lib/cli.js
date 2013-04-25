var program = require('commander'),
	path = require('path'),
	slice = [].slice;

<<<<<<< HEAD
console.log('cli')

=======
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
program
	.version('0.0.1');

program
    .command('server <path>')
    .description('在指定路径启动一个静态web服务器 e.g dpm server path')
    .option('-p, --port [int]', '端口号，默认从3000开始找一个可用的端口')
    .action(function(modulePath, cmd) {
        require('./server')(modulePath, parseInt(cmd.port) || null);
    });
   
program
    .command('watch <path>')
    .description('监听一个目录，进行各种实时编译')
    .option('-h, --html', '把html编译成同名cmd模块')
    .action(function(watchPath, cmd) {
        if (cmd.html) {
            require('./html-to-js')(watchPath);
        }
    });
   
program
    .command('watch-html <path>')
    .description('把html编译成同名cmd模块')
    .action(function(watchPath, cmd) {
        require('./html-to-js')(watchPath);
    });

program
    .command('compress <filePath> <mappingPath>')
    .description('压缩文件')
    .option('-a, --all', '把所有外部模块一起编入')
    // .option('-p, --mappingPath <file>', '这个文件在网站上对应的路径')
    .action(function(filePath, mappingPath, cmd) {        
        if (arguments.length < 3) {
            console.log('参数错误，示例：dpm /path/to/app.js //web-root-path-start-with-double-slash/to/app.js');
        } else {
            //使用两个slash开头，否则系统会把路径直接转换程本机路径，所以这里要去掉一个slash
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 30568aa419e4df846adfd3faf25e96c6d045e478
            // if (mappingPath.indexOf('//') !== 0) {
            //     console.log('请输入以//开头的路径，例如：//mod/src/app.js');
            //     return;
            // }
            require('./compress')(filePath, mappingPath, cmd);
<<<<<<< HEAD
=======
=======
            if (mappingPath.indexOf('//') !== 0) {
                console.log('请输入以//开头的路径，例如：//mod/src/app.js');
                return;
            }
            require('./compress')(filePath, mappingPath.substring(1), cmd);
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
>>>>>>> 30568aa419e4df846adfd3faf25e96c6d045e478
        }
    });

/*
program
	.command('module <path>')
	.description('构建通用模块并同步module.json文件')
	.option('-C, --MCF', '默认是 ./module.json')
	.option('-T, --MTP [path]', '默认是 path/../module_templates')
	.action(function (path, cmd) {
		require('./module').init(path, cmd);
	});
*/

program
    .command('module <path>')
    .description('同步模块和module.json文件')
    .option('-f, --file', '默认是 path/modules.json')
    .option('-t, --templates [path]', '默认是 path/../module_templates/')
    .action(function(path, cmd) {
        require('./module').sync(path, cmd)
    });

program
<<<<<<< HEAD
    .command('sync <server> <appName>')
=======
<<<<<<< HEAD
    .command('sync <server> <appName>')
    .description('上传文件到服务器')
    .option('-w, --watch', '默认不监控本地目录的改变')
    .action(function (server, appName, cmd) {
        require('./sync')(server, appName, cmd);
    });

program
    .command('mkapp <path> <app>')
    .description('新建应用程序')
    .action(function (path, app) {
        require('./app')(path, app)
    })
=======
    .command('sync <env>')
>>>>>>> 30568aa419e4df846adfd3faf25e96c6d045e478
    .description('上传文件到服务器')
    .option('-w, --watch', '默认不监控本地目录的改变')
    .action(function (server, appName, cmd) {
        require('./sync')(server, appName, cmd);
    });

program
<<<<<<< HEAD
    .command('mkapp <path> <app>')
    .description('新建应用程序')
    .action(function (path, app) {
        require('./app')(path, app)
    })
=======
    .command('deploy <env>')
    .description('测试环境或上线部署')
    .option('-a, --all', '把所有外部模块一起编入')
    .action(function (env, cmd) {
        require('./deploy')(env, cmd);
    });
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
>>>>>>> 30568aa419e4df846adfd3faf25e96c6d045e478

program.parse(process.argv);
