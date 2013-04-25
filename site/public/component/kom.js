define(function(require) {
    var ko = require('knockout');
    var _ = require('underscore');
    var $ = require('jquery');

    var create = function(o) {
        var ret = {};

        _.each(o, function(value, key) {
            ret[key] = ko[_.isArray(value) ? 'observableArray' : 'observable'](value);
        });

        return ret;
    };

    var update = function(model, data) {
        _.each(data, function(value, key) {
            (key in model) && model[key](value);
        });
    };

    var toJS = function (model, ignore) {
        var data = {};

        _.each(model, function (value, key) {
            var v =  ko.utils.unwrapObservable(value);

            _.isObject(v) && !_.isFunction(v) && (v = $.extend(true, _.isArray(v) ? [] : {}, v));

            if (_.indexOf(ignore, key) === -1 && !_.isFunction(v)) {
                data[key] = v;
            }
        });

        return data;
    }

    return {
        create: create,
        update: update,
        toJS: toJS
    };

});