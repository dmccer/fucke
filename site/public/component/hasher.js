define(function(require, exports, module) {
    var $ = require('jquery'),
        _ = require('underscore'),
        ko = require('knockout'),
        parse, 
        stringify, 
        hasher, 
        gHash, 
        oldSubscribe, 
        redirectMapping, 
        start, 
        hashFilter;

    // hash.path 重定向映射
    redirectMapping = {};

    /**
     * hash 字符串转 hash 对象
     * ---
     * hash 对象格式: 
     *   - { path: ''[, query: {}] }
     * hash 字符串格式: 
     *   - encodeURIComponent({"path":"pay/contract"})
     */
    parse = function(str) {
        var data = {};
        if (str.length > 3) {
            try {
                data = JSON.parse(decodeURIComponent(str.substring(1)));
            } catch (e) {
                console.log('parse hasher error:' + str);
            }         
        }
        return data;
    };
    
    /**
     * hash 对象转 hash 字符串
     */
    stringify = function(data) {
        return '#' + encodeURIComponent(JSON.stringify(data));
    };

    // 当前 hash
    gHash = parse(location.hash);

    /**
     * hasher
     */
    hasher = function(value) {
        if (value) {                      
            location.hash = stringify(value);
        } else {
            return gHash;
        }
    };

    // 扩展 hasher
    ko.subscribable.call(hasher);

    // subscribe总会获得一个当前的hash值
    oldSubscribe = hasher.subscribe;

    hasher.subscribe = function(fn) {
        oldSubscribe.call(this, fn);
        fn(this());
    };

    start = function() {
        var hash = parse(location.hash);
        
        if (redirectMapping[hash.path]) {
            hash.path = redirectMapping[hash.path];                    
            location.replace(stringify(hash));
            // replace之后会再次出发hashchange事件，所以这里可以退出了            
            return;
        };

        gHash = hash;
        hasher.notifySubscribers(hash);        
    };

    /**
     * 解析 path 的映射
     * ---
     * HTTP 错误分发(由应用程序自定义)
     */
    hashFilter = function () {
        // 当前已经改变的 hash 
        var hash = parse(location.hash);
        
        // 获取映射并重定向
        if(redirectMapping[hash.path]) {            
            hash.path = redirectMapping[hash.path];
            // 重定向
            location.replace(stringify(hash));
            // replace之后会再次触发 hashchange 事件，并进入 hashFilter 函数，此时无需重定向
            return;
        }

        gHash = hash;
        // 若无需重定向，则手动触发 hash 的监听处理器
        hasher.notifySubscribers(hash);
    };

    _.extend(hasher, {
        parse: parse,

        stringify: stringify,

        mapping: function(_mapping) {
            _.extend(redirectMapping, _mapping);
        },

        update: function(data) {
            hasher(_.extend(hasher(), data));
        },

        start: function(index) {
            // 监听 hash 的变化            
            $(window).bind('hashchange', hashFilter);

            if (location.hash.length < 3 && index) {
                hasher(index);
            } else {
                start();
            }
        }
    });

    module.exports = hasher;
});