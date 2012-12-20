var watcher = require('./watcher');
var path = require('path');
var next = require('next.js');
var fs = require('fs');
var colorized = require('console-colorjs');

var parseHTML = function(str) {
    return JSON.stringify(str.replace(/\r/g, '').replace(/\n/g, '').replace(/>\s*</g, '><'))
};

module.exports = function(dir) {
    next.pipe(
        watcher,
        function(file, callback) {
            next.pipe(
                function(file, callback) {
                    if (path.extname(file) === '.html') {
                        callback(null, file, 'utf8');
                    }
                },
                fs.readFile,
                function(str, callback) {
                    var jsPath = file.substring(0, file.length - 5) + '.js';
                    fs.writeFile(
                        jsPath, 
                        'define(function(){return ' + parseHTML(str) + '});',
                        'utf8',
                        callback
                    )
                    console.log(colorized.bright(jsPath) + ' compiled');
                }
            )(file, callback)
        }
        
    )(dir, function(err) {
        if (err) {
            console.log(err);
        }
    });
};