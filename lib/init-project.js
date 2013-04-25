var fs = require('fs');
var path = require('path');
var next = require('next.js');
var wrench = require('wrench');
var _ = require('underscore');
var exec = require('child_process').exec;
var colorized = require('console-colorjs');

var default_package_json = {
    main: './src/index',
    dependencies: {
        'jquery': '*',
        'bootstrap': '*',
        'underscore': '*',
        'knockout': '*',
        'knockout.mapping': '*',
        'seajs': '*'
    }
};

/*

moduleName/
    moduleName/
        example/
            index.html
        src/
            index.js
        package.json

 */

module.exports = function(modulePath) {
    wrench.mkdirSyncRecursive(modulePath, '0777');

    var moduleName = path.basename(modulePath);
    wrench.copyDirSyncRecursive(path.join(__dirname, '../scaffold'), modulePath);

    require('./remote-file-promise')(require('./config').moduleConfigUrl).then(function(str) {
        fs.writeFileSync(path.join(modulePath, 'all-modules.json'), str);
    });

    default_package_json.name = moduleName;
    fs.writeFileSync(path.join(modulePath, 'package.json'), JSON.stringify(default_package_json, null, 4), 'utf-8');
    console.log('init ' + colorized.cyan(modulePath) + ' complete');
};
