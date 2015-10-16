/**
 * request.js
 * @author Vivian
 * @version 1.0.0
 * copyright 2014-2015, gandxiaowei@gmail.com all rights reserved.
 */
var request = (function () {
    return {
        get: function (url, option) {
            option = option || {};
            var xhr = new XMLHttpRequest();
            xhr.open('get', url);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var result = JSON.parse(xhr.responseText);
                    if (option.success) {
                        option.success(result);
                    }
                }
            };
            xhr.send();
        },
        packet: function (url, option) {
            option = option || {};
            var xhr = new XMLHttpRequest();
            xhr.open('get', url);
            xhr.responseType = "arraybuffer";
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
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
            xhr.open('post', url);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
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