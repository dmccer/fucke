/**
 * 部署环境
 * ---
 * 部署过程：
 *   1. 读取相应环境配置
 *   2. 根据配置对代码进行压缩合并
 *   3. 根据配置上传指定文件到指定服务器
 *   4. 记录发布日志
 */
var cfg = require('./config'),
    compress = require('./compress'),
    fs = require('fs'),
    Ftp = require('jsftp'),
    deploy;

deploy = function (env, cmd) {
    var ftp;
    
    console.log('配置：\n%s \n%s', cfg.env[env].s, cfg.env[env].t);
    
    compress(cfg.env[env].s, cfg.env[env].t, cmd);
    
};

module.exports = deploy;
