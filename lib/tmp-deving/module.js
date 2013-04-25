var path = require('path'),
	fs = require('fs'),
	_ = require('underscore'),
	wrench = require('wrench');

// 全局配置
var G_CONF = {
	// 默认模块模版路径
	MTP: '../module_templates',
	// 默认模块配置文件
	MCF: 'modules.json',
	// 模块默认使用的模版引擎正则
	MTR: /\{\{(.+?)\}\}/g
};

/**
 * 配置 underscore 的模版引擎
 */
_.templateSettings = {
  interpolate : G_CONF.MTR
};

/**
 * 根据配置文件创建模块
 */
var crtModByConf = function (dir, mc) {
	console.log('OK - 根据配置文件模块创建成功！')
};

/**
 * 应用程序入口
 * ---
 * dir: [String] 模块根目录
 * opts: [Object] 配置项, 可选
 */
var init = function (dir, opts) {
	var root,
		// 模块配置文件路径
		p_mc,
		// 模块模版路径
		p_mt,
		// 模块配置文件内容
		c_mc;

	_.extend(G_CONF, opts);

	root = path.resolve(dir);
	p_mc = path.join(dir, G_CONF.MCF);
	p_mt = path.join(dir, G_CONF.MTP);

	if(!fs.existsSync(root)) {
		console.log('ERROR：您提供的目录不存在！');
	}

	if(!fs.existsSync(p_mt)) {
		console.log('WARNING：您还未创建模块模版！');

		try {
			fs.mkdirSync(p_mt, '0777');
		} catch (err) {
			console.log('ERROR: \n' + err);
		}
		
	} else {
		console.log('OK - 模块模版路径: ' + path.resolve(p_mt));
	}
	
	c_mc = fs.existsSync(p_mc) ? require(p_mc) : {};

	crtModByConf(dir, c_mc);
};

init('D:/work/dianping/finance_backup/mod_group/src/modules');