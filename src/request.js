/**
 * request.js
 * @author Vivian
 * @version 1.0.0
 * copyright 2014-2015, gandxiaowei@gmail.com all rights reserved.
 */
var request = (function () {

    var info = appInfo.get(true);

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

    function setHeaders(xhr) {
        xhr.setRequestHeader('ak', info.ak);
        xhr.setRequestHeader('sessionid', info.sessionid);
        xhr.setRequestHeader('userid', info.userid);
    }

    return {
        get: function (url, option) {
            option = option || {};
            var xhr = new XMLHttpRequest();
            xhr.open('get', serialize(url, option.param));
            setHeaders(xhr);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        if (xhr.responseText) {
                            var responseText = xhr.responseText;
                            if (responseText.indexOf('~') === 0) {
                                var base64 = new Base64();
                                responseText = base64.decode(responseText);
                            }
                            var result = JSON.parse(responseText);
                            if (option.success) {
                                option.success(result);
                            }
                        } else {
                            if (option.error) {
                                option.error('返回数据为空');
                            }
                        }
                    } else {
                        if (option.error) {
                            option.error('网络连接失败');
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
            setHeaders(xhr);
            xhr.responseType = "arraybuffer";
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var arrayBuffer = xhr.response;
                        var packet = new Packet();
                        var result = packet.decode(arrayBuffer);
                        if (option.success) {
                            option.success(result);
                        }
                    } else {
                        if (option.error) {
                            option.error('网络连接失败');
                        }
                    }
                }
            };
            xhr.send();
        },
        post: function (url, option) {
            option = option || {};
            var xhr = new XMLHttpRequest();
            xhr.open('post', serialize(url, option.param));
            setHeaders(xhr);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var result = JSON.parse(xhr.responseText);
                        if (option.success) {
                            option.success(result);
                        }
                    } else {
                        if (option.error) {
                            option.error('网络连接失败');
                        }
                    }
                }
            };
            xhr.send(option.data);
        }
    };
})();