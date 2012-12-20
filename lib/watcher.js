var fs = require('fs');
var next = require('next.js');
var path = require('path');

var FILE_LAST_MODIFIED_TIME = {};

var watchAny = next.pipe(
    next.parallel(
        next.callback.echo,
        fs.stat
    ),
    
    function(file, stat, callback) {
        if (stat.isDirectory()) {
            watchDir(file, callback);
            return;
        } 

        if (stat.isFile()) {
            watchFile(file, stat, callback);
            return;
        }
    }
);

var watchFile = function(file, stat, callback) {
    var _path = path.resolve(file);
    if (!FILE_LAST_MODIFIED_TIME[_path] || stat.mtime > FILE_LAST_MODIFIED_TIME[_path]) {
        FILE_LAST_MODIFIED_TIME[_path] = stat.mtime;
        callback(null, _path);
    }
};

var watchDir = function(dir, callback) {
    fs.readdir(dir, function(err, files) {
        if (err) {
            callback(err);
        } else {
            files.forEach(function(file) {
                watchAny(path.join(dir, file), callback)
            });
        }
    })
};

var callbacks = [];
var running = false;
module.exports = function(dir, callback) {

    if (!running) {
        running = true;
        setInterval(function() {
            watchAny(dir, function(err, file) {
                callbacks.forEach(function(callback) {
                    callback(err, file);
                })
            });
        }, 1000);
    }    
    callbacks.push(callback);
};




