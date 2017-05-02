//var controllerModule = require('../../js/controllerModule.js');

/**
 * 算奖
 * date 2017-1-5
 * auth zhang
 * tel 15210007185
 */
angular.module('starter.controllers', [])
  .controller('CalculateCtrl', ['$scope', 'globalServices', 'calculateServices', '$stateParams', function($scope, globalServices, calculateServices, $stateParams) {

    $scope.default = {
      isAdditional: false,
      lotteryName: '',
      lotteryIssue: '',
      lotteryCode: $stateParams.lotteryCode,
      bonusNumber: []
    }

    $scope.$on('$ionicView.enter', function(){
      $scope.isShowShare =  window.device ? true : false;
    })
    // 清除计算奖金浮动框
     $scope.$on('$ionicView.leave', function() {
       $scope.popover && $scope.popover.hide();
     });
    $scope.$on('picker', function(event, val){
      $scope.cleanBall();
      $scope.default.bonusNumber = calculateServices.lotteryNumberHandle(val);
    })

    // 选号规则
    $scope.redBall = {
      number: [],
      ballLen: $stateParams.lotteryCode == '001' ? 33 : 35,
      minSize: $stateParams.lotteryCode == '001' ? 6 : 5
    };
    $scope.blueBall = {
      number: [],
      ballLen: $stateParams.lotteryCode == '001' ? 16 : 12,
      minSize: $stateParams.lotteryCode == '001' ? 1 : 2
    };
    // 清空选号
    $scope.cleanBall = function(){
      $scope.$broadcast('cleanBall');
    }

    // 获取最近十次开奖信息
    calculateServices.getLastIssue($scope);


    $scope.calculateHandle = function(){

      var number,
          isPoll = false;

      if ($scope.redBall.number.length < $scope.redBall.minSize) {
        globalServices.errorPrompt('红球最少选择' + $scope.redBall.minSize);
      } else if ($scope.blueBall.number.length < $scope.blueBall.minSize) {
        globalServices.errorPrompt('蓝球最少选择' + $scope.blueBall.minSize);
      } else {

        if ($scope.redBall.number.length > $scope.redBall.minSize || $scope.blueBall.number.length > $scope.blueBall.minSize) {
          isPoll = true;
        }
        number = unit.sortNumber($scope.redBall.number).join(',') + '#' + unit.sortNumber($scope.blueBall.number).join(',');

        /**
         * pollCode 单式or复式  01 => 单式  02 => 复式
         * playCode 是否有追加玩法 01 => 普通 02 => 追加
         */
        calculateServices.calculateHandle({lotteryCode: $scope.default.lotteryCode, issue: unit.getPattren($scope.default.lotteryIssue, /(\d+)/), pollCode: isPoll ? '02' : '01', playCode: $scope.default.isAdditional ? '02' : '01', number: number}, $scope);
      }
    }


  }])
