<<<<<<< HEAD
define(function (require, exports) {
    var _ = require('underscore');

    function _separateNum(s, c, t) {
        if (!s || !c || !t) {
            return '';
        }

        var i, l, count,
            tmpArr = [];

        i = 0, l = s.length;

        if (l <= c) {
            return s;
        }

        count = l % c == 0 ? (l / c) : (parseInt(l / c) + 1);

        if (t == 'dec') {
            while (i < count) {
                tmpArr.push(s.substring(i * c, (i + 1) * c));
                i++;
            };
        } else if (t == 'int') {
            while (i < count) {
                tmpArr.push(s.substring(l - i * c, l - (i + 1) * c));
                i++;
            };

            tmpArr.reverse();
        }

        return tmpArr.join(',');
    };

    exports.numSep = function (num, dec, c, isDoDec) {
        if (!num || !parseFloat(num)) {
            return '0';
        }

        var numArr, num_int, num_decimal, 
            s_int = '', 
            s_dec = '', 
            fixed = 2,
            num_s = num.toString().replace(/[^\d\.\-]/g, ''), 
            zero = '';

        !c && (c = 3);

        numArr = num_s.split('.');

        num_int = numArr[0];
        num_decimal = numArr[1];

        s_int += _separateNum(Math.abs(parseInt(num_int)) + '', c, 'int');
        s_dec += num_decimal && isDoDec ? _separateNum(num_decimal, c, 'dec') : (num_decimal ? num_decimal : '' );

        fixed = (dec || 2) - s_dec.length;

        while(fixed > 0) {
            zero += '0';
            fixed--;
        }

        if(fixed < 0) {
            s_dec = Math.round(parseInt(s_dec, 10)/Math.pow(10, Math.abs(fixed))) + '';
        }

        return (/^\-/.test(num_int) ? '-' : '') + s_int + '.' + s_dec + zero;        
    };

    exports.fixed = function (num, c, t) {
        var d = Math.pow(10, c);
        
        t = t || 'round';

        if(t && _.indexOf(['round', 'ceil', 'floor'], t) === -1) {
            throw new Error(t + ' is undefined in Math');
        }

        return Math[t](parseFloat(num)*d)/d;
    };

    exports.sum = function (list, key) {
        // [] || key, list
        var r = 0;

        if(!list && !key) {
            throw new Error('function sum need parameters!');
        }

        if(key) {
            if(list[0] && typeof list[0] === 'object') {
                _.each(list, function (item) {
                    r += item[key] || 0;
                });
            }            
        } else {
            _.each(list, function (item) {
                r += item;
            });
        }

        return r;
    };
=======
define(function (require, exports) {
    var _ = require('underscore');

    function _separateNum(s, c, t) {
        if (!s || !c || !t) {
            return '';
        }

        var i, l, count,
            tmpArr = [];

        i = 0, l = s.length;

        if (l <= c) {
            return s;
        }

        count = l % c == 0 ? (l / c) : (parseInt(l / c) + 1);

        if (t == 'dec') {
            while (i < count) {
                tmpArr.push(s.substring(i * c, (i + 1) * c));
                i++;
            };
        } else if (t == 'int') {
            while (i < count) {
                tmpArr.push(s.substring(l - i * c, l - (i + 1) * c));
                i++;
            };

            tmpArr.reverse();
        }

        return tmpArr.join(',');
    };

    exports.numSep = function (num, dec, c, isDoDec) {
        if (!num || !parseFloat(num)) {
            return '0';
        }

        var numArr, num_int, num_decimal, 
            s_int = '', 
            s_dec = '', 
            fixed = 2,
            num_s = num.toString().replace(/[^\d\.\-]/g, ''), 
            zero = '';

        !c && (c = 3);

        numArr = num_s.split('.');

        num_int = numArr[0];
        num_decimal = numArr[1];

        s_int += _separateNum(Math.abs(parseInt(num_int)) + '', c, 'int');
        s_dec += num_decimal && isDoDec ? _separateNum(num_decimal, c, 'dec') : (num_decimal ? num_decimal : '' );

        fixed = (dec || 2) - s_dec.length;

        while(fixed > 0) {
            zero += '0';
            fixed--;
        }

        if(fixed < 0) {
            s_dec = Math.round(parseInt(s_dec, 10)/Math.pow(10, Math.abs(fixed))) + '';
        }

        return (/^\-/.test(num_int) ? '-' : '') + s_int + '.' + s_dec + zero;        
    };

    exports.fixed = function (num, c, t) {
        var d = Math.pow(10, c);
        
        t = t || 'round';

        if(t && _.indexOf(['round', 'ceil', 'floor'], t) === -1) {
            throw new Error(t + ' is undefined in Math');
        }

        return Math[t](parseFloat(num)*d)/d;
    };

    exports.sum = function (list, key) {
        // [] || key, list
        var r = 0;

        if(!list && !key) {
            throw new Error('function sum need parameters!');
        }

        if(key) {
            if(list[0] && typeof list[0] === 'object') {
                _.each(list, function (item) {
                    r += item[key] || 0;
                });
            }            
        } else {
            _.each(list, function (item) {
                r += item;
            });
        }

        return r;
    };
>>>>>>> 94dc36a741fe479087ed52be7e58077f2de757e8
});