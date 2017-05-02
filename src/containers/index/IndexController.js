
/**
 * 首页
 */

angular.module('starter.controllers', []).controller('StartUpCtrl', ['$scope', 'globalServices', '$state', function($scope, globalServices, $state) {

    // 隐藏启动画面
    document.addEventListener("deviceready", function(){
        if(navigator && navigator.splashscreen) {
            navigator.splashscreen.hide();
        }
    }, false);

    $scope.startPlay = function(){
        globalServices.localStorageHandle('start', true);
        $state.go('tab.index');
    }
}])
    // 首页
    .controller('IndexCtrl', ['$scope', 'globalServices', 'indexServices', '$ionicScrollDelegate', '$rootScope', '$location', function($scope, globalServices, indexServices, $ionicScrollDelegate, $rootScope, $location) {

        document.addEventListener("deviceready", function(){
          initLoad();
          // 检查是否更新
          if (window.device) {
            globalServices.updateAPP();
          }

        }, false);


        function initLoad(){

            $scope.adList = globalServices.localStorageHandle('adList');
            $scope.lotteryList = globalServices.localStorageHandle('lotteryList');
            indexServices.getIndexLayer($scope);
        }

        $scope.$on('$ionicView.beforeEnter', function(){
          !window.device && initLoad();
          // 设置banner图高度
          $scope.banHeight = document.documentElement.clientWidth * 350/750 + 'px';
        });

        ////// 进入页面时
        $scope.$on('$ionicView.enter', function(){
          $scope.lotteryList = globalServices.localStorageHandle('lotteryList');
          $rootScope.rootTransparentHeader = false;
          $scope.$broadcast('loadImg');
        });

        $scope.repeatFinish = function(){
          $scope.$broadcast('loadImg');
        }
        // 页面加载完成
        $scope.$on('$ionicView.afterEnter', function(){
          globalServices.preImage(['./img/entry/login-bg.png',  './img/usercenter/bg_wo.png', './img/usercenter/ic_find_active.png', './img/usercenter/ic_programme_active.png', './img/usercenter/ic_house_active.png', './img/usercenter/ic_user_active.png']);
        })

    }])

    .controller('CustomizeCtrl', ['$scope', 'globalServices', function($scope, globalServices) {

        $scope.getImgPath = globalServices.getLotterySpell;
        $scope.lotteryList = globalServices.localStorageHandle('lotteryList');

        /**
         *
         * @param lotteryCode {Number}
         * @param status {String}
         */
        $scope.toggleHandle = function(lotteryCode, status){

            angular.forEach($scope.lotteryList, function(lottery){

                if (lottery.lotteryCode == lotteryCode) {
                    if (status == 1) {
                        lottery.status = 0;
                        globalServices.errorPrompt('已移除该彩种');
                    } else {
                        lottery.status = 1;
                        globalServices.errorPrompt('已成功添加该彩种');
                    }

                }
            })

            globalServices.localStorageHandle('lotteryList', $scope.lotteryList);

        }

    }])
