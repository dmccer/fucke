define(function(require) {
    var _ = require('underscore');
    var ko = require('knockout');

    ko.bindingHandlers.prop = {
        update: function(element, valueAccessor, allBindingsAccessor) {
            _.each(ko.utils.unwrapObservable(valueAccessor()) || {}, function(value, key) {
                element[key] = ko.utils.unwrapObservable(value);
            });
        }
    };
});