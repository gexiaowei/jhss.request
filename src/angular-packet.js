/**
 * @author Vivian
 * @version 1.0.0
 * copyright 2014-2015, gandxiaowei@gmail.com all rights reserved.
 */
(function (angular) {
    var module = angular.module('ngPacket', []);
    module.factory('$packet', function () {
        return new Packet();
    });
})(angular);
