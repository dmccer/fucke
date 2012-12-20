var http = require('http');
var q = require('q');


module.exports = function(repo) {
    var def = q.defer();

    http.get(repo, function(res) {
        res.setEncoding('utf8');

        var data = '';

        res.on('data', function(chunk) {
            data += chunk;
        });

        res.on('end', function() {
            def.resolve(data);
        });

        res.on('error', function(e) {
            def.reject(e)
        });
    });

    return def.promise;
};


