define(function (require, exports) {
	var _ = require('underscore');	
	
	var enumKeys, enums,
		toString = Object.prototype.toString;	

	exports.setEnumConfig = function (config) {
		enums = config;

		enumKeys = _.map(_.keys(enums), function (value) {
			return (value + '').replace(/List$/, '');
		});
	};

	exports.getTextOfEnum = function (field, value) {
	    var obj, list = enums[field + 'List'];

	    obj = _.filter(list, function (item) {
	        return item.value === value;
	    })[0];

	    if(!obj) {
	    	console.log('Error in Enum field: ', field, ' value: ', value)
	    }
	    
	    return obj.text;
	};

	exports.getValueOfEnum = function (field, text) {
		var obj, list = enums[field + 'List'];

	    obj = _.filter(list, function (item) {
	        return item.text === text;
	    })[0];

	    return obj.value;
	};

	// item[field] 可以为 0 ，except 为不需要替换的字段集合
	exports.fill = function (d, except) {
		var type, _replace;

		type = toString.call(d);
		_replace = function (item) {
			_.each(enumKeys, function (field) {
				if(!except || _.indexOf(except, field) === -1) {
					(item[field] != null) && (item[field] = exports.getTextOfEnum(field, item[field]));
				}
			});
		};		

		if(type === '[object Array]') {
			_.each(d, function (record) {
	            _replace(record);
	        });
		} else if(type === '[object Object]')  {
			_replace(d);
		}        
	};

	exports.revert = function (d, except) {
		var type, _replace;
		
		type = toString.call(d);
		except = !!except && (typeof except === 'string') ? [except] : ((toString.call(except) === '[object Array]') ? except : []);
		
		_replace = function (item) {
			_.each(enumKeys, function (field) {
				if(!except || _.indexOf(except, field) === -1) {
					(item[field] != null) && (item[field] = exports.getValueOfEnum(field, item[field]));
				}
			});
		};		

		if(type === '[object Array]') {
			_.each(d, function (record) {
	            _replace(record);
	        });
		} else if(type === '[object Object]')  {
			_replace(d);
		}
	};

	exports.dump = function (d, keys) {
		var ret = {};

		_.each(keys, function (k) {
			ret[k] = d[k];
		});

		return ret;
	};
	
});