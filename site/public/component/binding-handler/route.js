<<<<<<< HEAD
define(function(require) {
    var $ = require('jquery');
    var ko = require('knockout');
    var hasher = require('hasher');

    var routeIsMatch = function(route, data) {
        return route === '*' || data.path === route;
    };

    ko.bindingHandlers.route = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var route = ko.utils.unwrapObservable(valueAccessor());
            var $element = $(element);

            hasher.subscribe(function(data) {
                $element[routeIsMatch(route, data) ? 'show' : 'hide']();
            });
        }
    }
=======
define(function(require) {
    var $ = require('jquery');
    var ko = require('knockout');
    var hasher = require('hasher');

    var routeIsMatch = function(route, data) {
        return route === '*' || data.path === route;
    };

    ko.bindingHandlers.route = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var route = ko.utils.unwrapObservable(valueAccessor());
            var $element = $(element);

            hasher.subscribe(function(data) {
                $element[routeIsMatch(route, data) ? 'show' : 'hide']();
            });
        }
    }
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
});