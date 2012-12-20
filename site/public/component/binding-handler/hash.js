define(function(require) {
    var $ = require('jquery');
    var _ = require('underscore');
    var ko = require('knockout');
    var hasher = require('hasher');

    ko.bindingHandlers.hash = {
        update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var hash = ko.utils.unwrapObservable(valueAccessor());
         
            var attr = allBindingsAccessor().attr || {};
            attr.href = hasher.stringify(hash);

            allBindingsAccessor().attr = attr;

            ko.bindingHandlers.attr.update(element, function() {
                return attr;
            }, allBindingsAccessor, viewModel);
        }
    };

});