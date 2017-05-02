//var controllerModule = require('../../js/controllerModule.js');

/**
*date 2016-10-18
* auth zhang
* tel 15210007185
 */

// 开奖
angular.module('starter.controllers', []).controller('LotteryCtrl', ['$scope', 'lotteryServices', 'globalServices', function($scope, lotteryServices, globalServices){
    $scope.lotterys = [];



    /**
     * lotteryCode 001 => 双色球
     * lotteryCode 002 => 福彩3D
     * lotteryCode 113 => 大乐透
     * lotteryCode 108 => 排列三
     * lotteryCode 109 => 排列五
     * lotteryCode 004 => 七乐彩
     * lotteryCode 110 => 七星彩
     * lotteryCode 018 => 北京快三
     * lotteryCode 011 => 江苏快三
     * lotteryCode 010 => 安徽快三
     * lotteryCode 110 => 七星彩
     * lotteryCode 110 => 七星彩
     */
    $scope.lotterys = globalServices.localStorageHandle('lottery');
    $scope.$on('$ionicView.afterEnter', function(){
      lotteryServices.lottery($scope);
    });
    $scope.doRefresh = function(){
      lotteryServices.lottery($scope);
    }


}]).controller('LotteryListCtrl', ['$scope', 'globalServices', 'lotteryServices', '$stateParams', function($scope, globalServices, lotteryServices, $stateParams){


    $scope.pathName = unit.getPattren(location.hash, /#\/tab\/(\w+)lotterylist/);

    $scope.lotteryList = [];
    $scope.lotteryCode = $stateParams.id;
    var lotteryBonus = lotteryServices.LotteryBonus($scope.lotteryCode);
    $scope.$on('$ionicView.afterEnter', function(){
        $scope.isMore = true;
        $scope.doRefresh = function(){
            $scope.loadMore(1, function(){
                $scope.$broadcast('scroll.refreshComplete')
            })
        }
        $scope.loadMore = function(page, fn){


            // 获取中奖信息
            lotteryBonus(page).then(function(re){

                if (re.isOffLine) {
                  $scope.$broadcast('scroll.refreshComplete');
                  $scope.$broadcast('scroll.infiniteScrollComplete');
                  return;
                }
                // 没有下一页
                if (re.issueList < 10) {
                    $scope.isMore = false;
                }

                // 追加数据
                if (!page && $scope.lotteryList.length ) {
                    $scope.lotteryList = $scope.lotteryList.concat(globalServices.serializeLottery(re.issueList));
                } else {
                    $scope.lotteryList = globalServices.serializeLottery(re.issueList);
                }
                $scope.lotteryTitle = $scope.lotteryList[0].lotteryName;

                // 下拉刷新
                if (fn) {
                    fn();
                } else {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
            })
        }
    })

}])
