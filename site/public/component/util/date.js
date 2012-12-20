define(function (require, exports) {
	var _ = require('underscore');

	//将日期对象转换为日期字符串，如：new Date() -> 2012-8-27
    var dateFormat = function (d) {
        if(!d) {
            return;
        }

        var yy, mm, dd, h, m, s, r = '';

        yy = d.getFullYear();
        mm = d.getMonth() + 1;
        dd = d.getDate();

        r = yy + '-' + (mm < 10 ? '0' + mm : mm) + '-' + dd;
        return r;
    };

    exports.dateFormat = dateFormat;
	
});