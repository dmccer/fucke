/**
 * # 错误监控平台
 * 
 * ## author yunhua.xiao@dianping.com
 * 
 * ## version 0.0.1
 * 
 */
define(function (require, exports, module) {
	var _ = require('underscore'),
		$ = require('jquery');

	require('./console.css');

	var $infoEl, logger, init,
		count = 0, 
		isInit = true;

	init = function () {
		var $consoleEl, $closeEl, $title,
			isOpen = false,
			CONSOLE_TPL = '<div class="__console-dpfi"><span class="__console-close-dpfi">X</span><h1>T</h1><div class="__console-info-dpfi"></div></div>';
		
		// 将监控台插入dom中
		$consoleEl = $(CONSOLE_TPL).appendTo(document.body);

		// 检测是否插入成功
		if(!$consoleEl) {
			console.log('Error - 控制台元素没有插入DOM中!');
			return;
		}

		console.log('OK - 控制台已插入DOM中!');

		// 若成功则初始化控制台各个部分
		
		// 监控台标题
		$title = $('h1', $consoleEl);
		// 关闭按钮
		$closeEl = $('.__console-close-dpfi', $consoleEl);
		// 错误信息容器
		$infoEl = $('.__console-info-dpfi', $consoleEl);

		// 绑定监控台各部分事件
		
		// 展开监控台事件
		$title.bind('click', function (e) {
			e.stopPropagation();
			e.preventDefault();

			if(isOpen) {
				return;
			}

			$title.text('错误监控台');
			
			$consoleEl.animate({
				width: 500,
				height: 300,
				padding: 10
			}, 500, function () {				
				$closeEl.fadeIn('fast');				
			});

			isOpen = true;
		});

		// 关闭监控台事件
		$closeEl.bind('click', function (e) {
			e.stopPropagation();
			e.preventDefault();

			$closeEl.fadeOut('fast', function () {
				$title.text('T');
				$consoleEl.animate({
					width: 25,
					height: 32,
					padding: 0
				}, 500);				
			});

			isOpen = false;
		});

		isInit && logger('OK - 控制台初始化完成！') && (isInit = false);
	};

	logger = function (s) {
		if(!$infoEl) {
			return;
		}

		$infoEl.append('<div class="clearfix"><span class="__console-count-dpfi">' + (++count) + ' : </span><div class="__console-error-info-dpfi">' + s + '</div></div>');
	};

	$(function () {
		init();
		
		window.onerror = function () {
			logger('<dl><dt>' + arguments[0] + '</dt><dd><a href="' + arguments[1] + '">出错文件</a>&nbsp;<span>行数：' + arguments[2] + '</span></dd></dl>');
		};
	});

	module.exports = logger;
});