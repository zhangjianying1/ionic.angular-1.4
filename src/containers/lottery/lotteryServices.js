/**
 * @date 2016-09-30
 * @auth zhang
 * @tel 15210007185
 */

// 开奖
angular.module('starter.services', []).factory('lotteryServices', ['globalServices', function(globalServices){
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
    return{
        // 获取开奖信息
        lottery: function($scope){
            var This = this;

            globalServices.post(4000, 'index').then(function(re){
              $scope.lotterys = globalServices.serializeLottery(re.issueList);
              $scope.$broadcast('scroll.refreshComplete');
              globalServices.localStorageHandle('lottery', $scope.lotterys);
            });
        },




        // 获取彩种开奖信息
        LotteryBonus: function(lotteryCode){

            var page = 0;


            return function(argPage){

                if (!argPage) {
                    page ++;
                } else {
                    page = argPage;
                }
                return  globalServices.post(4000, 'list', {lotteryCode: lotteryCode, page: page});
            }


        }
    }

}])
