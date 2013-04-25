/**
 * 功能：
 *   合并并压缩指定路径下的js/css文件，包括js依赖文件
 * 作者：Kane dmccer@gmail.com
 * 
 * TODO:
 *   1. 根据指定路径寻找js文件及其依赖文件;
 *   2. 修正依赖文件路径;
 *   3. 合并所有js文件;
 *   4. 合并所有css文件;
 *   5. 压缩合并后的js和css文件，并保存
 */
var path = require('path'),
	fs = require('fs'),
	wrench = require('wrench'),
	next = require('next.js'),
	_ = require('underscore'),
	colorized = require('console-colorjs');



