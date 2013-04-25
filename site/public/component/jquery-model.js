define(function(require) {
    var $ = require('jquery');
    var _ = require('underscore');
    var ko = require('knockout');

    var noop = function() {};

    $.fn.extend({
        model: function(model) {
            var elem = this[0];

            if (model) {
                if (!model.update) {
                    console.log(model)
                    throw new Error('model must implement method: update');
                }
                ko.applyBindings(model, elem);
                return this;
            } else { 
                return ko.dataFor(elem);           
            }
        }
    });
});