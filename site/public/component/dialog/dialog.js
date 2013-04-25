<<<<<<< HEAD
define(function (require, exports, module) {
	var $ = require('jquery'),
		_ = require('underscore');

	require('./dialog.css');

	/**
	 * # dialog tpl
	 * 
	 * ---
	 * 
	 * <div class="{{classPrefix}}-dialog {{classPrefix}}-dialog-focused">
	 *     <div class="ui-dialog-header"></div>
	 *     <div class="ui-dialog-content"></div>
	 *     <div class="ui-dialog-footer"></div>
	 * </div>
	 * 
	 */

	var dialog,	Dialog,
		NOOP = function () {},
		BASE_Z_INDEX = 1000,
		DIALOG_TPL = '<div class="ui-dialog"><div class="ui-dialog-header clearfix"></div><div class="ui-dialog-content"></div><div class="ui-dialog-footer"></div></div>',
		CLOSE_TPL = '<a class="close">×</a>',
		OKBTN_TPL = '<a class="btn confirm-btn">确认</a>',
		CANCELBTN_TPL = '<a class="btn cancel-btn btn-primary">取消</a>',
		defaultConfig = {
			opts: {
				title: 'sdf收到罚单',
				buttons: {
					okbtn: {
						text: '确认',
						visible: false
					},
					cancelbtn: {
						text: '取消',
						visible: false
					}
				},
				// attrs: {
				// 	width: 500,
				// 	height: 300,
				// 	zIndex: 100
				// },
				closable: true
			}
		};
	/**
	 * # this is a dialog manager, use the name dialog just keep user interface be simple
	 */
	dialog = {
		curdialog: null,

		dialogMap: {},

		size: function () {
			return _.keys(this.dialogMap).length;
		},

		// 确认框，提示框
		prompt: function () {
			this._popup('prompt', Array.prototype.slice.call(arguments));
		},

		// 警告框
		alert: function () {
			this._popup('alert', Array.prototype.slice.call(arguments));
		},

		_get: function (path) {
			return this.dialogMap[path];
		},

		_set: function (path, dialog) {
			var hasOne = this._get(path);
			!hasOne && (this.dialogMap[path] = dialog);
		},

		_popup: function (type) {
			var config = _.extend({}, defaultConfig), 
				key = '',
				data = _.extend({}, config.opts),
				fn = NOOP,
				self = this;

			console.log('dialog::popup: ', arguments);			

			if(arguments.length > 1) {
				key = arguments[1].length && arguments[1][0];
				data = (arguments[1].length > 1) && ($.type(arguments[1][1]) === 'object') && arguments[1][1];
				fn = (arguments[1].length > 2) && ($.type(arguments[1][2]) === 'function') && arguments[1][2];
			}

			$(function () {
				$.extend(true, config, {
					'tpl': key,
					'fn': fn,
					'opts': data
				});

				console.log('dialog::config: ', config);

				switch(type) {
					case 'prompt':
						config.opts.buttons.okbtn.visible = true;
						config.opts.buttons.cancelbtn.visible = true;
						break;
					case 'alert':
						config.opts.buttons.okbtn.visible = true;
						config.opts.buttons.cancelbtn.visible = false;
						break;
					case 'custom':
						config.opts.buttons.okbtn.visible = false;
						config.opts.buttons.cancelbtn.visible = false;
						break;
					default:
						break;
				}

				if(self.dialogMap[type + key]) {
					self.dialogMap[type + key].show();
				} else {
					self.dialogMap[type + key] = new Dialog({
						'tpl':  key,
						'fn': fn, // call after close dialog
						'opts': data
					});

					self.dialogMap[type + key].show();
				}

				// (self.dialogMap[type + key] || (self.dialogMap[type + key] = new Dialog({
				// 	'tpl':  key,
				// 	'fn': fn, // call after close dialog
				// 	'opts': data
				// }))).show();

				console.log('xxxxxxxxx: ', self.dialogMap[type + key]);

				self.curdialog = self.dialogMap[type + key];
			});
		},

		show: function (type, key) {
			if(type && key) {
				this.curdialog = this.dialogMap[type + key] && this.dialogMap[type + key].show() || null;
			} else if(type && this.curdialog && _.keys(this.dialogMap)[_.indexOf(_.values(this.dialogMap), this.curdialog)].indexOf(type) !== -1) {
				this.curdialog.show();
			}
		},

		close: function (type, key) {
			if(type && key) {
				this.dialogMap[type + key] && this.dialogMap[type + key].hide();
			} else if(type && this.curdialog && _.keys(this.dialogMap)[_.indexOf(_.values(this.dialogMap), this.curdialog)].indexOf(type) !== -1) {
				this.curdialog.hide();
			}

			this.curdialog = null;
		},

		destroy: function (type, key) {
			if(type && key) {
				this.dialogMap[type + key] && this.dialogMap[type + key].destroy();
			} else if(type && this.curdialog && _.keys(this.dialogMap)[_.indexOf(_.values(this.dialogMap), this.curdialog)].indexOf(type) !== -1) {
				this.curdialog.destroy();
				this.curdialog = null;
			}			
		}
	};

	$(function () {
		$(window).bind('resize', function () {
			if(dialog.curdialog) {
				console.log('dialog.curdialog: ', dialog.curdialog)
				dialog.curdialog.resize(dialog.curdialog);
				dialog.curdialgo.repos(dialog.curdialog);
			}			
		})
	});

	/**
	 * # class Dialog
	 * # param {[Object]} opt [dialog配置]
	 * 
	 * ---
	 *
	 * ## opt 
	 *    tpl: String
	 *    fn: Function // callback
	 *    closable: Boolean // 是否可关闭，右上角是否有关闭的标记，默认true
	 *    buttons: Object
	 *        # okbtn: Boolean // 默认false
	 *        # cancelbtn: Boolean // 默认false
	 *    attrs: Object // dialog样式属性
	 *        # width: Number // 对话框宽度
	 *        # height: Number // 对话框高度
	 *        # zIndex: Number // 可选, 默认为 1000, 设置对话框的 z-index 值
	 * 
	 */
	Dialog = function (config) {
		this.config = $.extend(true, defaultConfig, config);

		//  must dom ready
		this.$dialog = $(document.body).append(DIALOG_TPL).children(':last');
		this.$dialog.css({'position': 'absolute', 'left': 0, 'top': 0, 'display': 'none'});

		this.$header = $('.ui-dialog-header', this.$dialog);
		this.$content = $('.ui-dialog-content', this.$dialog);
		this.$footer = $('.ui-dialog-footer', this.$dialog);

		this.value = 'default'; // 默认为default，确定为true, 取消为false
	};

	Dialog.prototype = {
		constructor: Dialog,

		show: function () {
			var attrs = {}, pos = {}, footerHtml = '';

			// beforeShow
			this._beforeShow();

			// 更新dialog header			
			this.$header.html('<h3>' + this.config.opts.title + '</h3>');
			
			!this.$closebtn && this.$header.before(this.config.opts.closable ? CLOSE_TPL : '');
			// 关闭标记
			this.$closebtn = this.$dialog.find('a.close'); 

			// 更新dialog content
			this.$content.html(this.config.tpl);

			// 更新dialog footer
			footerHtml += this.config.opts.buttons.okbtn.visible ? OKBTN_TPL : '';
			footerHtml += this.config.opts.buttons.cancelbtn.visible ? CANCELBTN_TPL : '';
			this.$footer.html(footerHtml);			
			// 确定和取消按钮
			this.$okbtn = this.$footer.find('a.confirm-btn');
			this.$cancelbtn = this.$footer.find('a.cancel-btn');

			// 1. 调整dialog大小
			this.resize(this);
			// 2. 调整dialog位置(x, y, z)
			this.repos(this);
			// 3. 显示dialog
			this.$dialog.fadeIn();

			// afterShow 在dialog绑定事件之前
			this._afterShow();
			
			// 给dialog绑定初始事件
			this.bindDialog();

			// afterBind 在dialog绑定事件之后
			this._afterBind();
		},

		resize: function (dialogIns) {
			var attrs = {};

			$.extend(true, attrs, {
				// dialog 大小
				width: 'auto',
				height: 'auto',
				overflow: 'auto'
			}, dialogIns.config.opts.attrs || {});

			// 保存到配置中
			$.extend(true, dialogIns.config.opts.attrs, attrs);

			dialogIns.$content.css(attrs);
		},

		repos: function (dialogIns) {
			var pos = {};

			$.extend(true, pos, {				
				zIndex: BASE_Z_INDEX + dialog.size()
			}, dialogIns.config.opts.attrs || {}, {
				// dialog 位置
				left: $(window).scrollLeft() + ($(window).width() - dialogIns.$dialog.outerWidth())/2,
				top: $(window).scrollTop() + ($(window).height() - dialogIns.$dialog.outerHeight())/2
			});

			// 保存到配置中
			$.extend(true, dialogIns.config.opts.attrs, pos);

			console.log('dialog::position-left: ', pos.left, 'dialog::position-top', pos.top);

			dialogIns.$dialog.css(pos);
		},

		hide: function () {
			// beforeClose 点击取消或关闭按钮立刻执行
			this._beforeClose();

			this.$dialog.fadeOut('fast', function () {
				$(this).css({'left': 0, 'top': 0});
			});

			// afterClose dialog关闭后执行
			this._afterClose();
		},

		destroy: function () {
			this._beforeDestroy();

			this.$dialog.remove();

			this._afterDestroy();
		},

		bindDialog: function () {
			var self = this;

			this.$closebtn.bind('click', function (e) {
				console.log('dialog::click: close clicked');

				e.preventDefault();
				e.stopPropagation();

				self.hide();

				return false;
			});

			$([this.$okbtn[0], this.$cancelbtn[0]]).bind('click', function (e) {
				console.log('dialog::click: button clicked');

				e.preventDefault();
				e.stopPropagation();

				self.hide();
				self.config.fn.call(null, self.value, self);

				return false;
			});
		},

		_beforeShow: function () {
			(this.config.opts.show || NOOP).call(null, this);
		},

		_afterShow: function () {
			(this.config.opts.shown || NOOP).call(null, this);
		},

		_afterBind: function () {
			(this.config.opts.binded || NOOP).call(null, this);
		},

		_beforeClose: function () {
			(this.config.opts.hide || NOOP).call(null, this);
		},

		_afterClose: function () {
			(this.config.opts.hidden || NOOP).call(null, this);
		},

		_beforeDestroy: function () {
			(this.config.opts.destroy || NOOP).call(null, this);
		},

		_afterDestroy: function () {
			(this.config.opts.destroyed || NOOP).call(null, this);
		}
	};

	return dialog;
	
});
/**
 * # dialog widget
 *   * introduction for dialog widget
 *   
 * ---
 * 
 * ## dependencies
 *   * jquery
 *   * knockout
 *
 * ---
 * 
 * ## How to use this Dialog
 * 
 * ### 1. create a prompt
 * 		 dialog.prompt(path/to/dialog_tpl, data, callback);
 * 		 * path/to/dialog_tpl
 * 		 ** a html template for prompt inner content
 *
 * 		 * data: {}
 * 		 ** The data for prompt init
 * 
 * ---
 * 		 
 * ### 2. create a messagebox  
 * 		 dialog.mbox(path/to/dialog_tpl, data, callback);
 * 		 
=======
define(function (require, exports, module) {
	var $ = require('jquery'),
		_ = require('underscore');

	require('./dialog.css');

	/**
	 * # dialog tpl
	 * 
	 * ---
	 * 
	 * <div class="{{classPrefix}}-dialog {{classPrefix}}-dialog-focused">
	 *     <div class="ui-dialog-header"></div>
	 *     <div class="ui-dialog-content"></div>
	 *     <div class="ui-dialog-footer"></div>
	 * </div>
	 * 
	 */

	var dialog,	Dialog,
		NOOP = function () {},
		BASE_Z_INDEX = 1000,
		DIALOG_TPL = '<div class="ui-dialog"><div class="ui-dialog-header clearfix"></div><div class="ui-dialog-content"></div><div class="ui-dialog-footer"></div></div>',
		CLOSE_TPL = '<a class="close">×</a>',
		OKBTN_TPL = '<a class="btn confirm-btn">确认</a>',
		CANCELBTN_TPL = '<a class="btn cancel-btn btn-primary">取消</a>',
		defaultConfig = {
			opts: {
				title: 'sdf收到罚单',
				buttons: {
					okbtn: {
						text: '确认',
						visible: false
					},
					cancelbtn: {
						text: '取消',
						visible: false
					}
				},
				// attrs: {
				// 	width: 500,
				// 	height: 300,
				// 	zIndex: 100
				// },
				closable: true
			}
		};
	/**
	 * # this is a dialog manager, use the name dialog just keep user interface be simple
	 */
	dialog = {
		curdialog: null,

		dialogMap: {},

		size: function () {
			return _.keys(this.dialogMap).length;
		},

		// 确认框，提示框
		prompt: function () {
			this._popup('prompt', Array.prototype.slice.call(arguments));
		},

		// 警告框
		alert: function () {
			this._popup('alert', Array.prototype.slice.call(arguments));
		},

		_get: function (path) {
			return this.dialogMap[path];
		},

		_set: function (path, dialog) {
			var hasOne = this._get(path);
			!hasOne && (this.dialogMap[path] = dialog);
		},

		_popup: function (type) {
			var config = _.extend({}, defaultConfig), 
				key = '',
				data = _.extend({}, config.opts),
				fn = NOOP,
				self = this;

			console.log('dialog::popup: ', arguments);			

			if(arguments.length > 1) {
				key = arguments[1].length && arguments[1][0];
				data = (arguments[1].length > 1) && ($.type(arguments[1][1]) === 'object') && arguments[1][1];
				fn = (arguments[1].length > 2) && ($.type(arguments[1][2]) === 'function') && arguments[1][2];
			}

			$(function () {
				$.extend(true, config, {
					'tpl': key,
					'fn': fn,
					'opts': data
				});

				console.log('dialog::config: ', config);

				switch(type) {
					case 'prompt':
						config.opts.buttons.okbtn.visible = true;
						config.opts.buttons.cancelbtn.visible = true;
						break;
					case 'alert':
						config.opts.buttons.okbtn.visible = true;
						config.opts.buttons.cancelbtn.visible = false;
						break;
					case 'custom':
						config.opts.buttons.okbtn.visible = false;
						config.opts.buttons.cancelbtn.visible = false;
						break;
					default:
						break;
				}

				if(self.dialogMap[type + key]) {
					self.dialogMap[type + key].show();
				} else {
					self.dialogMap[type + key] = new Dialog({
						'tpl':  key,
						'fn': fn, // call after close dialog
						'opts': data
					});

					self.dialogMap[type + key].show();
				}

				// (self.dialogMap[type + key] || (self.dialogMap[type + key] = new Dialog({
				// 	'tpl':  key,
				// 	'fn': fn, // call after close dialog
				// 	'opts': data
				// }))).show();

				console.log('xxxxxxxxx: ', self.dialogMap[type + key]);

				self.curdialog = self.dialogMap[type + key];
			});
		},

		show: function (type, key) {
			if(type && key) {
				this.curdialog = this.dialogMap[type + key] && this.dialogMap[type + key].show() || null;
			} else if(type && this.curdialog && _.keys(this.dialogMap)[_.indexOf(_.values(this.dialogMap), this.curdialog)].indexOf(type) !== -1) {
				this.curdialog.show();
			}
		},

		close: function (type, key) {
			if(type && key) {
				this.dialogMap[type + key] && this.dialogMap[type + key].hide();
			} else if(type && this.curdialog && _.keys(this.dialogMap)[_.indexOf(_.values(this.dialogMap), this.curdialog)].indexOf(type) !== -1) {
				this.curdialog.hide();
			}

			this.curdialog = null;
		},

		destroy: function (type, key) {
			if(type && key) {
				this.dialogMap[type + key] && this.dialogMap[type + key].destroy();
			} else if(type && this.curdialog && _.keys(this.dialogMap)[_.indexOf(_.values(this.dialogMap), this.curdialog)].indexOf(type) !== -1) {
				this.curdialog.destroy();
				this.curdialog = null;
			}			
		}
	};

	$(function () {
		$(window).bind('resize', function () {
			if(dialog.curdialog) {
				console.log('dialog.curdialog: ', dialog.curdialog)
				dialog.curdialog.resize(dialog.curdialog);
				dialog.curdialgo.repos(dialog.curdialog);
			}			
		})
	});

	/**
	 * # class Dialog
	 * # param {[Object]} opt [dialog配置]
	 * 
	 * ---
	 *
	 * ## opt 
	 *    tpl: String
	 *    fn: Function // callback
	 *    closable: Boolean // 是否可关闭，右上角是否有关闭的标记，默认true
	 *    buttons: Object
	 *        # okbtn: Boolean // 默认false
	 *        # cancelbtn: Boolean // 默认false
	 *    attrs: Object // dialog样式属性
	 *        # width: Number // 对话框宽度
	 *        # height: Number // 对话框高度
	 *        # zIndex: Number // 可选, 默认为 1000, 设置对话框的 z-index 值
	 * 
	 */
	Dialog = function (config) {
		this.config = $.extend(true, defaultConfig, config);

		//  must dom ready
		this.$dialog = $(document.body).append(DIALOG_TPL).children(':last');
		this.$dialog.css({'position': 'absolute', 'left': 0, 'top': 0, 'display': 'none'});

		this.$header = $('.ui-dialog-header', this.$dialog);
		this.$content = $('.ui-dialog-content', this.$dialog);
		this.$footer = $('.ui-dialog-footer', this.$dialog);

		this.value = 'default'; // 默认为default，确定为true, 取消为false
	};

	Dialog.prototype = {
		constructor: Dialog,

		show: function () {
			var attrs = {}, pos = {}, footerHtml = '';

			// beforeShow
			this._beforeShow();

			// 更新dialog header			
			this.$header.html('<h3>' + this.config.opts.title + '</h3>');
			
			!this.$closebtn && this.$header.before(this.config.opts.closable ? CLOSE_TPL : '');
			// 关闭标记
			this.$closebtn = this.$dialog.find('a.close'); 

			// 更新dialog content
			this.$content.html(this.config.tpl);

			// 更新dialog footer
			footerHtml += this.config.opts.buttons.okbtn.visible ? OKBTN_TPL : '';
			footerHtml += this.config.opts.buttons.cancelbtn.visible ? CANCELBTN_TPL : '';
			this.$footer.html(footerHtml);			
			// 确定和取消按钮
			this.$okbtn = this.$footer.find('a.confirm-btn');
			this.$cancelbtn = this.$footer.find('a.cancel-btn');

			// 1. 调整dialog大小
			this.resize(this);
			// 2. 调整dialog位置(x, y, z)
			this.repos(this);
			// 3. 显示dialog
			this.$dialog.fadeIn();

			// afterShow 在dialog绑定事件之前
			this._afterShow();
			
			// 给dialog绑定初始事件
			this.bindDialog();

			// afterBind 在dialog绑定事件之后
			this._afterBind();
		},

		resize: function (dialogIns) {
			var attrs = {};

			$.extend(true, attrs, {
				// dialog 大小
				width: 'auto',
				height: 'auto',
				overflow: 'auto'
			}, dialogIns.config.opts.attrs || {});

			// 保存到配置中
			$.extend(true, dialogIns.config.opts.attrs, attrs);

			dialogIns.$content.css(attrs);
		},

		repos: function (dialogIns) {
			var pos = {};

			$.extend(true, pos, {				
				zIndex: BASE_Z_INDEX + dialog.size()
			}, dialogIns.config.opts.attrs || {}, {
				// dialog 位置
				left: $(window).scrollLeft() + ($(window).width() - dialogIns.$dialog.outerWidth())/2,
				top: $(window).scrollTop() + ($(window).height() - dialogIns.$dialog.outerHeight())/2
			});

			// 保存到配置中
			$.extend(true, dialogIns.config.opts.attrs, pos);

			console.log('dialog::position-left: ', pos.left, 'dialog::position-top', pos.top);

			dialogIns.$dialog.css(pos);
		},

		hide: function () {
			// beforeClose 点击取消或关闭按钮立刻执行
			this._beforeClose();

			this.$dialog.fadeOut('fast', function () {
				$(this).css({'left': 0, 'top': 0});
			});

			// afterClose dialog关闭后执行
			this._afterClose();
		},

		destroy: function () {
			this._beforeDestroy();

			this.$dialog.remove();

			this._afterDestroy();
		},

		bindDialog: function () {
			var self = this;

			this.$closebtn.bind('click', function (e) {
				console.log('dialog::click: close clicked');

				e.preventDefault();
				e.stopPropagation();

				self.hide();

				return false;
			});

			$([this.$okbtn[0], this.$cancelbtn[0]]).bind('click', function (e) {
				console.log('dialog::click: button clicked');

				e.preventDefault();
				e.stopPropagation();

				self.hide();
				self.config.fn.call(null, self.value, self);

				return false;
			});
		},

		_beforeShow: function () {
			(this.config.opts.show || NOOP).call(null, this);
		},

		_afterShow: function () {
			(this.config.opts.shown || NOOP).call(null, this);
		},

		_afterBind: function () {
			(this.config.opts.binded || NOOP).call(null, this);
		},

		_beforeClose: function () {
			(this.config.opts.hide || NOOP).call(null, this);
		},

		_afterClose: function () {
			(this.config.opts.hidden || NOOP).call(null, this);
		},

		_beforeDestroy: function () {
			(this.config.opts.destroy || NOOP).call(null, this);
		},

		_afterDestroy: function () {
			(this.config.opts.destroyed || NOOP).call(null, this);
		}
	};

	return dialog;
	
});
/**
 * # dialog widget
 *   * introduction for dialog widget
 *   
 * ---
 * 
 * ## dependencies
 *   * jquery
 *   * knockout
 *
 * ---
 * 
 * ## How to use this Dialog
 * 
 * ### 1. create a prompt
 * 		 dialog.prompt(path/to/dialog_tpl, data, callback);
 * 		 * path/to/dialog_tpl
 * 		 ** a html template for prompt inner content
 *
 * 		 * data: {}
 * 		 ** The data for prompt init
 * 
 * ---
 * 		 
 * ### 2. create a messagebox  
 * 		 dialog.mbox(path/to/dialog_tpl, data, callback);
 * 		 
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
 */