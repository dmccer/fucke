/**
 * 新建应用程序
 * ============
 *
 * 作者 [Kane](http://www.svger.com 'BLOG') <dmccer@gmail.com>
 *
 * 时间：*2012-1-25*
 *
 * 功能
 * ----
 * 1. 根据指定应用程序名称创建应用程序目录结构
 * 
 */
var

path = require('path'),
wrench = require('wrench'),
colorized = require('console-colorjs'),
tplPath = path.join(path.dirname(process.argv[0]), 'node_modules', 'fucker/lib/tpl-app')

module.exports = function (appPath, appName) {
    if (!appPath) {
        appPath = ''
    }

    if (appName === '') {
        console.log(colorized.bright('应用程序名不能为空！'))
        return
    }

    wrench.copyDirSyncRecursive(tplPath, path.join(path.resolve(appPath), appName))
}