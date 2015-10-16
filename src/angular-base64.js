/**
 * @author Vivian
 * @version 1.0.0
 * copyright 2014-2015, gandxiaowei@gmail.com all rights reserved.
 */
(function (angular) {
    var module = angular.module('ngBase64', []);
    module.factory('$base64', function () {
        return new Base64();
    });
})(angular);
