/*
 *
 * OpenX Javascript Client
 *
 * Date: 2015-01-22
 */
function OpenxClient() {

    var _default_timeout = 3 * 60 * 1000; //default timeout time in mm

    var _openx_header = '_openx_header';
    var _openx_conf = '_openx_conf';

    var _self = this;
    var _store = localStorage;

    this.conf = function (conf) {
        if (!_self.isNull(conf)) {
            _store.setItem(_openx_conf, $.toJSON(conf));
        } else {
            var json = _store.getItem(_openx_conf);
            return $.evalJSON(json);
        }
    };

    this.head = function (key, val) {
        var header = _store.getItem(_openx_header);
        if (this.isBlank(header)) {
            header = '{"xSessionId":"' + Math.uuid() + '"}';
            _store.setItem(_openx_header, header);
        }
        var json = $.evalJSON(header);
        // if write operation
        if (!this.isBlank(key)) {
            json.key = val;
            _store.setItem(_openx_header, $.toJSON(json));
        }
        return json;
    };

    this.invoke = function (url, method, type, data, timeout, onResult, onError) {
        if (type == 'html' || type == 'app') {
            this.invokeByPost(url, method, type, data, timeout, onResult, onError);
        } else if (type == 'jsonp') {
            this.invokeByJsonp(url, method, type, data, timeout, onResult, onError);
        } else {
            alert('Unknown invoke type ' + type);
        }
    };

    this.invokeByPost = function (url, method, type, data, timeout, onResult, onError) {
        data._openx_head = _self.head();
        var json = $.toJSON(data);
        var time_out = _default_timeout;
        if (!this.isBlank(timeout)) {
            time_out = timeout;
        }

        $.ajax({
            timeout: time_out,
            url: url + '?client=app',
            type: 'post',
            contentType: "application/json",
            data: json,
            success: onResult ? onResult : function (json) {
                alert('default callback:' + json);
            },
            error: function (xhr, status, error) {
                if (onError) {
                    onError(error)
                } else {
                    alert('default error: ' + status + '-' + error);
                }
            }
        });
    };

    this.invokeByJsonp = function () {
        data._openx_head = _self.head();
        var json = $.toJSON(data);
        var bs64 = $.base64.encode(json);
        var time_out = _default_timeout;
        if (!this.isBlank(timeout)) {
            time_out = timeout;
        }
        $.ajax({
            timeout: time_out,
            url: url,
            type: method,
            dataType: type,
            data: 'client=app' + '&' + bs64,
            success: onResult ? onResult : function (json) {
                alert('default callback:' + json);
            },
            error: function (xhr, status, error) {
                if (onError) {
                    onError(error)
                } else {
                    alert('default error: ' + status + '-' + error);
                }
            }
        });
    };

    this.isArray = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    this.isBlank = function (str) {
        if (_self.isNull(str)) {
            return true;
        } else return (str == '' || str.length == 0);
    };

    this.isNull = function (obj) {
        return (obj == null || obj == undefined);
    }
};

// global OpenX client instance
var openx = new OpenxClient();


//////////////////////////////////////////////////////////////////////////////////////////

/**
 * New Openx js client, more modern ! 2015-05-19
 */
function $X(mapping, method) {
    var _m = mapping;
    var _t = method;

    this.conf = function (conf) {
        openx.conf(conf)
    };

    this.callx = function (data, timeout) {
        var url = openx.conf()['url'] + _m + '/' + _t;
        if (openx.isNull(data)) {
            data = {};
        }

        // show error on default div(id=message)
        if (openx.isNull(data.onError)) {
            data.onError = function (error) {
                var msg = $('#message');
                if (!openx.isNull(msg)) {
                    if (msg.length > 0) {
                        msg.html('系统异常！' + error);
                    } else {
                        console.log('default error: ' + status + '-' + error);
                    }
                }
            };
        }
        openx.invoke(url, 'get', openx.conf()['type'], data, timeout, data.onResult, data.onError);
    };

    return this;
}