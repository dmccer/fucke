define(function (require, exports, module) {
	var $ = require('jquery'),
		logger = require('component/console/console'),
		LOADING_TPL = '<div class="__loading-dpfi" style="display: none;"></div><div class="__loading-text-dpfi" style="display: none;">正在努力加载中，请稍候 ...</div>',
		$loadingEl;
	
	require('./ajax.css');

	var request = function (opt) {
		var _opt, error = opt.error || defaultError;
	
		$loadingEl = $loadingEl || $(LOADING_TPL).appendTo(document.body);

		_opt = $.extend({
			type: 'GET',
			dataType: 'json',
			cache: false,
			beforeSend: function (jqXHR, settings) {
				$loadingEl.fadeIn();
			},
			complete: function (jqXHR, textStatus) {
				$loadingEl.fadeOut();		
			},
			statusCode: {
				404: _404,
				500: _500,
				302: _302
			}
		}, opt, {
			success: function (d) {
	        	if(!d || !d.code || d.code !== 200) {
	        		error(this, d.code, d.msg);
	        	}

	        	if(d.code == 200) {
	        		opt.success.call(null, (d.msg != null) ? d.msg : '' );
	        	}
	        },
	        
	        error: error
		});

		//debugger;
		//_opt.url = seajs.pluginSDK.util.parseAlias('app/' + _opt.url)

		$.ajax(_opt);
	};

	function defaultError(x, s, e) {
		var msg = '';

		if(s === null) {
			msg += 'AJAX请求发生未知错误！';
		}

		switch(s) {
			case 'timeout':
				msg += 'AJAX请求超时！';
				break;
			case 'error':
				msg += 'AJAX请求发生未知错误！';
				break;
			case 'abort':
				msg += 'AJAX请求中断！';
				break;
			case 'parsererror':
				msg += 'AJAX请求响应的数据不是正确的JSON格式！';
				break;
			case 500:
				msg += e;
				break;
		}

		logger('AJAX错误：' + msg);

		console.log('AJAX请求过程发生错误：\nxhr: %s\nstatus: %s\nerror: %s', x, s, e);		
	}

	function _404() {
		logger('AJAX错误：404 - 未找到指定的资源！');
		console.log('AJAX 404: ', arguments.length);
	}

	function _500() {
		logger('AJAX错误：500 - 服务器发生未知错误！请联系相关技术人员！');
		console.log('AJAX 500: ', arguments.length);
	}

	function _302() {
		logger('AJAX错误：302 - 请求被服务器重定向！');
		console.log('AJAX 500: ', arguments.length);
	}

	module.exports = request;
});