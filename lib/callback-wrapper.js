var slice = [].slice;

module.exports = function(fn, args, success, fail) {
    if (!fail) {
        fail = function(err) {
            console.log(err);
        }
    }

    if (!success) {
        success = function() {};
    }

    fn.apply(null, args.concat([function(err) {
        if (err) {
            fail(err);
        } else {
            success.apply(null, slice.call(arguments, 1));
        }
    }]));
};