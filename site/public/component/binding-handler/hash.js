<<<<<<< HEAD
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

=======
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

>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
});