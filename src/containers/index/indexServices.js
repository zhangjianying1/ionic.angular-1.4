/**
 * @date 2016-10-22
 * @auth zhang
 * @tel 15210007185
 */

// 开奖
angular.module('starter.services', []).factory('indexServices', ['globalServices', '$rootScope', function(globalServices, $rootScope) {
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
    return {
        getIndexLayer: function($scope){
            var account = globalServices.localStorageHandle('account');

           globalServices.post('1000', 'start').then(function(re){
                var lotteryList;

                if (re.lotteryList) {
                    // status 0 => 要隐藏的彩种 1 => 要显示的彩种
                    angular.forEach(re.lotteryList, function(lottery, index){
                        if (index < 7) {
                            lottery.status= 1;
                        } else {
                            lottery.status = 0;
                        }
                    })

                    $scope.adList = re.adList;

                    globalServices.localStorageHandle('adList', re.adList);

                    // 第一次进入app
                    if (!(lotteryList = globalServices.localStorageHandle('lotteryList'))) {
                        $scope.lotteryList = re.lotteryList;
                        globalServices.localStorageHandle('lotteryList', re.lotteryList);

                    } else {
                        $scope.$broadcast('scroll.refreshComplete')
                    }
                }


               // 隐藏启动画面
               if(navigator && navigator.splashscreen) {

                   navigator.splashscreen.hide();
                   // 自动登录
                   globalServices.autoSignin(account)
               }
            });

        }
    }
}])
