//var controllerModule = require('../../js/controllerModule.js');


/**
 * 用户中心
 * @date 2016-10-27
 * @auth zhang
 * @tel 15210007185
 */



// 账户中心
angular.module('starter.controllers', []).controller('UserFuncCtrl', ['$scope', 'globalServices', 'accountService', function($scope, globalServices, accountService) {

    $scope.loadMore = function(){

        alert(3)
    }
    $scope.text = '张'

}])
