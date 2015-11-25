/**
 * request.js
 * @author Vivian
 * @version 1.0.0
 * copyright 2014-2015, gandxiaowei@gmail.com all rights reserved.
 */
var request = (function () {

    function serialize(url, param) {
        if (!param) {
            return url;
        }
        var temp = '';
        for (var key in param) {
            temp += ('&' + key + '=' + param[key]);
        }

        if (url.indexOf('?') < 0) {
            temp = temp.replace('&', '?');
        }

        return url + temp;

    }

    return {
        get: function (url, option) {
            option = option || {};
            var xhr = new XMLHttpRequest();
            xhr.open('get', serialize(url, option.param));
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    if (xhr.responseText) {
                        var result = JSON.parse(xhr.responseText);
                        if (option.success) {
                            option.success(result);
                        }
                    } else {
                        if (option.error) {
                            option.error('返回数据为空');
                        }
                    }

                }
            };
            xhr.send();
        },
        packet: function (url, option) {
            option = option || {};
            var xhr = new XMLHttpRequest();
            xhr.open('get', serialize(url, option.param));
            xhr.responseType = "arraybuffer";
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var arrayBuffer = xhr.response;
                    var packet = new Packet();
                    var result = packet.decode(arrayBuffer);
                    if (option.success) {
                        option.success(result);
                    }
                }
            };
            xhr.send();
        },
        post: function (url, option) {
            option = option || {};
            var xhr = new XMLHttpRequest();
            xhr.open('post', serialize(url, option.param));
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var result = JSON.parse(xhr.responseText);
                    if (option.success) {
                        option.success(result);
                    }
                }
            };
            xhr.send(option.data);
        }
    };
})();