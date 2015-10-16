/**
 * angular-request.js
 * @author Vivian
 * @version 1.0.0
 * copyright 2014-2015, gandxiaowei@gmail.com all rights reserved.
 */
(function (angular) {
    var module = angular.module('ngRequest', ['ngBase64', 'ngPacket']);
    module
        .factory('resultInterceptor', ['$base64', '$packet', '$q', function ($base64, $packet, $q) {
            return {
                'response': function (response) {
                    //packet解析
                    var result;
                    if (response.data instanceof ArrayBuffer) {
                        try {
                            result = $packet.decode(response.data);
                            response.data = result;
                        } catch (error) {
                            console.log(error);
                        }
                    }

                    if (typeof(response.data) === 'string') {
                        if (response.data.indexOf('~') === 0) {
                            result = $base64.decode(response.data);
                        }
                        if (!!result) {
                            response.data = JSON.parse(result);
                        }
                    }


                    var errorMsg;
                    if (response.data.status) {
                        var status, message;
                        if (response.data.status instanceof Array) {
                            status = response.data.status[0].status;
                            message = response.data.status[0].message;
                        } else {
                            status = response.data.status;
                            message = response.data.message;
                        }
                        switch (status) {
                            case '0101':
                                errorMsg = (message || '请重新登录');
                                break;
                            case '0000':
                                break;
                            default :
                                errorMsg = (message || '未知错误，请联系开发人员');
                                break;
                        }
                    }
                    if (errorMsg) {
                        return $q.reject(errorMsg);
                    }
                    return response;
                },
                'responseError': function (rejection) {
                    return rejection;
                }
            };
        }])
        .config(['$httpProvider', function ($httpProvider) {
            var info = appInfo.get(true);
            $httpProvider.defaults.headers.common.ak = info.ak;
            $httpProvider.defaults.headers.common.sessionid = info.sessionid;
            $httpProvider.defaults.headers.common.userid = info.userid;

            $httpProvider.interceptors.push('resultInterceptor');
        }])
        .factory('$request', ['$http', function ($http) {
            return {
                packet: function (url, option) {
                    option = option || {};
                    option.responseType = 'arraybuffer';
                    return $http.get(url, option);
                },
                get: $http.get,
                post: $http.post
            };
        }]);
})(angular);