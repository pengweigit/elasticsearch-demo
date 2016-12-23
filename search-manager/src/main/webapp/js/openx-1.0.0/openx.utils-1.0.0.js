/**
 * jQuery JSON plugin 2.4.0
 *
 * @author Brantley Harris, 2009-2011
 * @author Timo Tijhof, 2011-2012
 * @source This plugin is heavily influenced by MochiKit's serializeJSON, which is
 *         copyrighted 2005 by Bob Ippolito.
 * @source Brantley Harris wrote this plugin. It is based somewhat on the JSON.org
 *         website's http://www.json.org/json2.js, which proclaims:
 *         "NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.", a sentiment that
 *         I uphold.
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
(function ($) {
    'use strict';

    var escape = /["\\\x00-\x1f\x7f-\x9f]/g,
        meta = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        hasOwn = Object.prototype.hasOwnProperty;

    /**
     * jQuery.toJSON
     * Converts the given argument into a JSON representation.
     *
     * @param o {Mixed} The json-serializable *thing* to be converted
     *
     * If an object has a toJSON prototype, that will be used to get the representation.
     * Non-integer/string keys are skipped in the object, as are keys that point to a
     * function.
     *
     */
    $.toJSON = typeof JSON === 'object' && JSON.stringify ? JSON.stringify : function (o) {
        if (o === null) {
            return 'null';
        }

        var pairs, k, name, val,
            type = $.type(o);

        if (type === 'undefined') {
            return undefined;
        }

        // Also covers instantiated Number and Boolean objects,
        // which are typeof 'object' but thanks to $.type, we
        // catch them here. I don't know whether it is right
        // or wrong that instantiated primitives are not
        // exported to JSON as an {"object":..}.
        // We choose this path because that's what the browsers did.
        if (type === 'number' || type === 'boolean') {
            return String(o);
        }
        if (type === 'string') {
            return $.quoteString(o);
        }
        if (typeof o.toJSON === 'function') {
            return $.toJSON(o.toJSON());
        }
        if (type === 'date') {
            var month = o.getUTCMonth() + 1,
                day = o.getUTCDate(),
                year = o.getUTCFullYear(),
                hours = o.getUTCHours(),
                minutes = o.getUTCMinutes(),
                seconds = o.getUTCSeconds(),
                milli = o.getUTCMilliseconds();

            if (month < 10) {
                month = '0' + month;
            }
            if (day < 10) {
                day = '0' + day;
            }
            if (hours < 10) {
                hours = '0' + hours;
            }
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            if (seconds < 10) {
                seconds = '0' + seconds;
            }
            if (milli < 100) {
                milli = '0' + milli;
            }
            if (milli < 10) {
                milli = '0' + milli;
            }
            return '"' + year + '-' + month + '-' + day + 'T' +
                hours + ':' + minutes + ':' + seconds +
                '.' + milli + 'Z"';
        }

        pairs = [];

        if ($.isArray(o)) {
            for (k = 0; k < o.length; k++) {
                pairs.push($.toJSON(o[k]) || 'null');
            }
            return '[' + pairs.join(',') + ']';
        }

        // Any other object (plain object, RegExp, ..)
        // Need to do typeof instead of $.type, because we also
        // want to catch non-plain objects.
        if (typeof o === 'object') {
            for (k in o) {
                // Only include own properties,
                // Filter out inherited prototypes
                if (hasOwn.call(o, k)) {
                    // Keys must be numerical or string. Skip others
                    type = typeof k;
                    if (type === 'number') {
                        name = '"' + k + '"';
                    } else if (type === 'string') {
                        name = $.quoteString(k);
                    } else {
                        continue;
                    }
                    type = typeof o[k];

                    // Invalid values like these return undefined
                    // from toJSON, however those object members
                    // shouldn't be included in the JSON string at all.
                    if (type !== 'function' && type !== 'undefined') {
                        val = $.toJSON(o[k]);
                        pairs.push(name + ':' + val);
                    }
                }
            }
            return '{' + pairs.join(',') + '}';
        }
    };

    /**
     * jQuery.evalJSON
     * Evaluates a given json string.
     *
     * @param str {String}
     */
    $.evalJSON = typeof JSON === 'object' && JSON.parse ? JSON.parse : function (str) {
        /*jshint evil: true */
        return eval('(' + str + ')');
    };

    /**
     * jQuery.secureEvalJSON
     * Evals JSON in a way that is *more* secure.
     *
     * @param str {String}
     */
    $.secureEvalJSON = typeof JSON === 'object' && JSON.parse ? JSON.parse : function (str) {
        var filtered =
            str
                .replace(/\\["\\\/bfnrtu]/g, '@')
                .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                .replace(/(?:^|:|,)(?:\s*\[)+/g, '');

        if (/^[\],:{}\s]*$/.test(filtered)) {
            /*jshint evil: true */
            return eval('(' + str + ')');
        }
        throw new SyntaxError('Error parsing JSON, source is not valid.');
    };

    /**
     * jQuery.quoteString
     * Returns a string-repr of a string, escaping quotes intelligently.
     * Mostly a support function for toJSON.
     * Examples:
     * >>> jQuery.quoteString('apple')
     * "apple"
     *
     * >>> jQuery.quoteString('"Where are we going?", she asked.')
     * "\"Where are we going?\", she asked."
     */
    $.quoteString = function (str) {
        if (str.match(escape)) {
            return '"' + str.replace(escape, function (a) {
                    var c = meta[a];
                    if (typeof c === 'string') {
                        return c;
                    }
                    c = a.charCodeAt();
                    return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
                }) + '"';
        }
        return '"' + str + '"';
    };

}(jQuery));

/**
 *  jQuery Base64
 */
jQuery.base64 = ( function( $ ) {
    var _PCR = ".",
        _CHR = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
        _VER = "1.1"; //Mr. Ruan fix to 1.1 to support asian char(utf8)

    function _getByte64( s, i ) {
        // This is oddly fast, except on Chrome/V8.
        // Minimal or no improvement in performance by using a
        // object with properties mapping chars to value (eg. 'A': 0)
        var idx = _CHR.indexOf( s.charAt( i ) );
        if ( idx === -1 ) {
            throw "Cannot decode base64";
        }
        return idx;
    }

    function _decode_chars(y, x){
        while(y.length > 0){
            var ch = y[0];
            if(ch < 0x80) {
                y.shift();
                x.push(String.fromCharCode(ch));
            }else if((ch & 0x80) == 0xc0){
                if(y.length < 2) break;
                ch = y.shift();
                var ch1 = y.shift();
                x.push(String.fromCharCode( ((ch & 0x1f) << 6) + (ch1 & 0x3f)));
            }else{
                if(y.length < 3) break;
                ch = y.shift();
                var ch1 = y.shift();
                var ch2 = y.shift();
                x.push(String.fromCharCode(((ch & 0x0f) << 12) + ((ch1 & 0x3f) << 6) + (ch2 & 0x3f)));
            }
        }
    }

    function _decode( s ) {
        var pads = 0,
            i,
            b10,
            imax = s.length,
            x = [],
            y = [];

        s = String( s );

        if ( imax === 0 ) {
            return s;
        }

        if ( imax % 4 !== 0 ) {
            throw "Cannot decode base64";
        }

        if ( s.charAt( imax - 1 ) === _PCR ) {
            pads = 1;

            if ( s.charAt( imax - 2 ) === _PCR ) {
                pads = 2;
            }
            // either way, we want to ignore this last block
            imax -= 4;
        }
        for ( i = 0; i < imax; i += 4 ) {
            var ch1 = _getByte64( s, i );
            var ch2 = _getByte64( s, i + 1);
            var ch3 = _getByte64( s, i + 2);
            var ch4 = _getByte64( s, i + 3);
            b10 = ( _getByte64( s, i ) << 18 ) | ( _getByte64( s, i + 1 ) << 12 ) | ( _getByte64( s, i + 2 ) << 6 ) | _getByte64( s, i + 3 );
            y.push(b10 >> 16);
            y.push((b10 >> 8) & 0xff);
            y.push(b10 & 0xff);
            _decode_chars(y, x);
        }
        switch ( pads ) {
            case 1:
                b10 = ( _getByte64( s, i ) << 18 ) | ( _getByte64( s, i + 1 ) << 12 ) | ( _getByte64( s, i + 2 ) << 6 );
                y.push(b10 >> 16);
                y.push((b10 >> 8) & 0xff);
                break;

            case 2:
                b10 = ( _getByte64( s, i ) << 18) | ( _getByte64( s, i + 1 ) << 12 );
                y.push(b10 >> 16);
                break;
        }
        _decode_chars(y, x);
        if(y.length > 0) throw "Cannot decode base64";
        return x.join( "" );
    }


    function _get_chars(ch, y){
        if(ch < 0x80) y.push(ch);
        else if(ch < 0x800){
            y.push(0xc0 + ((ch >> 6) & 0x1f));
            y.push(0x80 + (ch & 0x3f));
        }else{
            y.push(0xe0 + ((ch >> 12) & 0xf));
            y.push(0x80 + ((ch >> 6) & 0x3f));
            y.push(0x80 + (ch & 0x3f));
        }
    }

    function _encode( s ) {
        if ( arguments.length !== 1 ) {
            throw "SyntaxError: exactly one argument required";
        }
        s = String( s );
        if ( s.length === 0 ) {
            return s;
        }
        //s = _encode_utf8(s);
        var i,
            b10,
            y = [],
            x = [],
            len = s.length;
        i = 0;
        while(i < len){
            _get_chars(s.charCodeAt(i), y);
            while(y.length >= 3){
                var ch1 = y.shift();
                var ch2 = y.shift();
                var ch3 = y.shift();
                b10 = ( ch1 << 16 ) | ( ch2 << 8 ) | ch3;
                x.push( _CHR.charAt( b10 >> 18 ) );
                x.push( _CHR.charAt( ( b10 >> 12 ) & 0x3F ) );
                x.push( _CHR.charAt( ( b10 >> 6 ) & 0x3f ) );
                x.push( _CHR.charAt( b10 & 0x3f ) );
            }
            i++;
        }
        switch ( y.length ) {
            case 1:
                var ch = y.shift();
                b10 = ch << 16;
                x.push( _CHR.charAt( b10 >> 18 ) + _CHR.charAt( ( b10 >> 12 ) & 0x3F ) + _PCR + _PCR );
                break;

            case 2:
                var ch1 = y.shift();
                var ch2 = y.shift();
                b10 = ( ch1 << 16 ) | ( ch2 << 8 );
                x.push( _CHR.charAt( b10 >> 18 ) + _CHR.charAt( ( b10 >> 12 ) & 0x3F ) + _CHR.charAt( ( b10 >> 6 ) & 0x3f ) + _PCR );
                break;
        }
        return x.join( "" );
    }
    return {
        decode: _decode,
        encode: _encode,
        VERSION: _VER
    };

}( jQuery ) );

/**
 * Simple Map, impl by javascript
 */
function Map() {
    this.map = new Object('1');
    this.length = 0;

    this.size = function () {
        return this.length;
    };

    this.put = function (key, value) {
        if (!this.map['_' + key]) {
            ++this.length;
        }
        this.map['_' + key] = value;
    };

    this.remove = function (key) {
        if (this.map['_' + key]) {
            --this.length;
            return delete this.map['_' + key];
        } else {
            return false;
        }
    };

    this.containsKey = function (key) {
        return this.map['_' + key] ? true : false;
    };

    this.get = function (key) {
        return this.map['_' + key] ? this.map['_' + key] : null;
    };

    this.poll = function (key) {
        var val = this.get(key);
        this.remove(key);
        return val;
    };

    this.inspect = function () {
        var str = '';
        for (var each in this.map) {
            str += '\n' + each + '  Value:' + this.map[each];
        }
        return str;
    }
}

/*!
 Math.uuid.js (v1.4)
 http://www.broofa.com
 mailto:robert@broofa.com

 Copyright (c) 2010 Robert Kieffer
 Dual licensed under the MIT and GPL licenses.
*/

/*
 * Generate a random uuid.
 *
 * USAGE: Math.uuid(length, radix)
 *   length - the desired number of characters
 *   radix  - the number of allowable values for each character.
 *
 * EXAMPLES:
 *   // No arguments  - returns RFC4122, version 4 ID
 *   >>> Math.uuid()
 *   "92329D39-6F5C-4520-ABFC-AAB64544E172"
 *
 *   // One argument - returns ID of the specified length
 *   >>> Math.uuid(15)     // 15 character ID (default base=62)
 *   "VcydxgltxrVZSTV"
 *
 *   // Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62)
 *   >>> Math.uuid(8, 2)  // 8 character ID (base=2)
 *   "01001010"
 *   >>> Math.uuid(8, 10) // 8 character ID (base=10)
 *   "47473046"
 *   >>> Math.uuid(8, 16) // 8 character ID (base=16)
 *   "098F4D35"
 */
(function() {
    // Private array of chars to use
    var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

    Math.uuid = function (len, radix) {
        var chars = CHARS, uuid = [], i;
        radix = radix || chars.length;

        if (len) {
            // Compact form
            for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
        } else {
            // rfc4122, version 4 form
            var r;

            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            // Fill in random data.  At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random()*16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }

        return uuid.join('');
    };

    // A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance
    // by minimizing calls to random()
    Math.uuidFast = function() {
        var chars = CHARS, uuid = new Array(36), rnd=0, r;
        for (var i = 0; i < 36; i++) {
            if (i==8 || i==13 ||  i==18 || i==23) {
                uuid[i] = '-';
            } else if (i==14) {
                uuid[i] = '4';
            } else {
                if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
                r = rnd & 0xf;
                rnd = rnd >> 4;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
        return uuid.join('');
    };

    // A more compact, but less performant, RFC4122v4 solution:
    Math.uuidCompact = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    };
})();

/**
 * Extend date, add format method
 */
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,                //月份
        "d+": this.getDate(),                     //日
        "h+": this.getHours(),                    //小时
        "m+": this.getMinutes(),                  //分
        "s+": this.getSeconds(),                  //秒
        "S": this.getMilliseconds(),             //毫秒
        "TT": this.getHours() < 12 ? "AM" : "PM"
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "")
            .substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k])
                : (("00" + o[k]).substr(("" + o[k]).length)));
        }
        ;
    }
    return fmt;
};


/**
 * Extend string, add helper method
 */

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.isNumber = function (str) {
    if (str == null || str == undefined || str == '' || str.length == 0) {
        return false;
    }

    for (var i = 0; i < str.length; i++) {
        if (str.charAt(i) < "0" || str.charAt(i) > "9") {
            return false;
        }
    }
    return true;
}

String.prototype.isIpAddress = function (address, like) {
    if (address == null || address == undefined || address == '' || address.length == 0) {
        return false;
    }

    var parts = address.split(".");
    if (!like && parts.length != 4) {
        return false;
    }

    // var part;
    for (var part in parts) {
        if (part.isNumber(parts[part])) {
            if (parseInt(parts[part]) < 0 || parseInt(parts[part]) > 255) {
                return false;
            }
        } else {
            return false;
        }
    }
    return true;
};

String.prototype.formatByteSize = function (size) {
    if (size == 0) {
        return '0 Byte';
    }
    var sizeNames = [' ', ' K', ' M', ' G', ' T', ' P', ' E', ' Z', ' Y'];
    var i = Math.floor(Math.log(size) / Math.log(1024));
    var p = (i > 1) ? 1 : 0;
    return (size / Math.pow(1024, Math.floor(i))).toFixed(p) + sizeNames[i];
};

/**
 * URL Parameter helper, ex param['userName']
 */
function UrlParameter() {
    var url = location.search;
    var up = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        var str2 = str.split("&");
        for (var i = 0; i < str2.length; i++) {
            up[str2[i].split("=")[0]] = decodeURI(str2[i].split("=")[1]);
        }
    }
    return up;
};

var param = UrlParameter();