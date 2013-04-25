define(function (require) {
	// 应用程序入口
	var $ = require('jquery'),
		_ = require('underscore'),
		request = require('request');

	require('component/console/console');
	require('bootstrap/../../css/bootstrap.css');
    require('bootstrap/../../css/bootstrap-responsive.css');

    $(function () {
    	var $errors_list = $('#errors_list');

    	request({
    		url: 'errors',
    		data: { errs: [{ info: 'Uncaught error: a is not defined', url: location.href }] },
    		success: function (d) {
    			var s = '<ul>';

    			_.each(d, function (err) {
    				console.log(err);
    				s += '<li>错误信息：' + err.info + '，<a href="' + err.url + '">查看</a></li>';
    			});

    			s += '</ul>';

    			$errors_list.html(s);	
    		}
    	})
    });
});