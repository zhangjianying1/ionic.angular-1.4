

/**
 *
 * 2017-1-11
 * @auth zhang
 * @tel 15210007185
 * 计算奖金服务
 */


angular.module('starter.services', []).factory('calculateServices', ['globalServices', '$ionicModal', '$rootScope', '$q', function(globalServices, $ionicModal, $rootScope, $q) {

  return {
    getLastIssue: function($scope){
      var This = this;

      globalServices.post(4000, 'list', {lotteryCode: $scope.default.lotteryCode, page: 1}).then(function(re){

        var tempArr = re.issueList;

        if (angular.isArray(tempArr)) {

          if (tempArr[0] && tempArr[0].bonusNumber && tempArr[0].bonusNumber.search(/\d/) < 0) {

            tempArr.splice(0, 1);
          }
          globalServices.serializeLottery(tempArr);
          $scope.lastIssue = serializeIssue(tempArr);
          $scope.default.lotteryIssue = $scope.lastIssue[0].value;

          $scope.default.lotteryName = tempArr[0].lotteryName;

          This.lotteryNumberHandle('calculate', tempArr);
        }
      });

      function serializeIssue(data){

        angular.forEach(data, function(val, index){
          val.value = '第' + val.issue + '期开奖结果';
          val.active = false;
        })

        return data;
      }
    },
    /**
     * 根据期次活动开奖号码
     * @param issue {String} 缓存的key 或者要查询的key
     * @param data {Array}
     * @returns {Array}
     */
    lotteryNumberHandle: function(issue, data){

      var bonusData, result = [];

      // 如果data 不存在就是获取期次
      if (angular.isUndefined(data)) {
        bonusData = globalServices.cache('calculate');
        result = [];

        angular.forEach(bonusData, function(bonus){

          if (bonus.value == issue) {
            result = bonus.bonusNumber;
          }
        })
        return result;
      } else {
        globalServices.cache('calculate', data);
      }

    },
    bBtn: true,
    calculateHandle: function(arg, $scope){

      var This = this;

      if (This.bBtn) {
        This.bBtn = false;

        globalServices.serialPost(4000, 'calc', arg).then(function(re){
          This.showCalculateResult(re, $scope);
        }, function(re){
          This.bBtn = true;
        });
      }
    },
    showCalculateResult: function(re, $scope) {
      var This = this;
      re.bonusNumber = getNumberArr(re.bonusNumber);
      re.number = getNumberArr(re.number);

      function getNumberArr(str){
        var tempArr = str.split('#');
        return [tempArr[0].split(',').join(' '), tempArr[1].split(',').join(' ')]
      }
      $scope.data = re;

      if (!$scope.popover) {
        $ionicModal.fromTemplateUrl('./templates/calculate/calculateresult.html?d', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(popover) {
          $scope.popover = popover;
          popover.show();
          This.bBtn = true;
        });
      } else {
        $scope.popover.show();
        This.bBtn = true;
      }


      $scope.closePopover = function() {
        $scope.popover.hide();
      };
    }
  }
}])
