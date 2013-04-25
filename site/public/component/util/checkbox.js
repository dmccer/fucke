<<<<<<< HEAD
define(function (require, exports) {
	var _ = require('underscore');

	/**
	 * [getChecks description]
	 * @param   {[Array<Object>]} list 数据集合, 每个元素为object
	 * @param   {[String]} uniqueKey 返回值的每个元素
	 * @returns {[Array]} [description]
	 */
	exports.getChecks = function (list, uniqueKey) {
		var d = _.filter(list, function (item) {
            return item.isChecked;
        });

        d = _.map(d, function (item) {
            return item[uniqueKey];
        });
        
        return d;
	};

    exports.getCheckedItems = function (list, uniqueKey) {
        return _.filter(list, function (item) {
            return item.isChecked;
        });
    }
	
=======
define(function (require, exports) {
	var _ = require('underscore');

	/**
	 * [getChecks description]
	 * @param   {[Array<Object>]} list 数据集合, 每个元素为object
	 * @param   {[String]} uniqueKey 返回值的每个元素
	 * @returns {[Array]} [description]
	 */
	exports.getChecks = function (list, uniqueKey) {
		var d = _.filter(list, function (item) {
            return item.isChecked;
        });

        d = _.map(d, function (item) {
            return item[uniqueKey];
        });
        
        return d;
	};

    exports.getCheckedItems = function (list, uniqueKey) {
        return _.filter(list, function (item) {
            return item.isChecked;
        });
    }
	
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
});