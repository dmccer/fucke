define(function(require) {
    var $ = require('jquery');
    var _ = require('underscore');
    var ko = require('knockout');
    var hasher = require('hasher');

    var HASH_DATA_KEY = 'query';
    var HASH_PATH_KEY = 'path';

    var routeIsMatch = function(route, data) {
        return !route || route === '*' || data[HASH_PATH_KEY] === route;
    };


    ko.bindingHandlers.include = {
        init: function(container, valueAccessor, allBindingsAccessor) {

            var uri = 'module/' + ko.utils.unwrapObservable(valueAccessor());

            require.async([uri], function(creatModule) {   

                var $element = creatModule();

                $element.appendTo(container)

                var route = ko.utils.unwrapObservable(allBindingsAccessor().route);

                hasher.subscribe(function(data) {                    
                    if (routeIsMatch(route, data)) {
                        $element.model().update(data[HASH_DATA_KEY]);
                    }
                });
            });

            return {
                controlsDescendantBindings: true
            };
        }
    }
    
});