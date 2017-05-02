//var controllerModule = require('../../js/controllerModule.js');

/**
 * 用户中心
 * @date 2016-10-27
 * @auth zhang
 * @tel 15210007185
 */

// 账户中心
angular.module('starter.controllers', []).controller('ProgrammeCtrl', ['$scope', 'globalServices', 'programmeServices', function($scope, globalServices, programmeServices) {
    $scope.programmes = [];
    $scope.isMore = true;
    //globalServices.showLoginLayout();

    $scope.loadMore = function(index){

        programmeServices.programme($scope, index)
    }
    $scope.doRefresh = function(){
        $scope.loadMore(1)
    };

}])


// 方案详情
.controller('ProgrammeDetailCtrl', ['$scope', 'globalServices', 'programmeServices', '$stateParams', '$ionicPopup', '$state', function($scope, globalServices, programmeServices, $stateParams, $ionicPopup, $state) {

    var programme = $scope.programme = programmeServices.getProgramme($stateParams.programmeCode);
    $scope.programme.couponAmount = $stateParams.couponAmount;
    $scope.programme.payCount = ($scope.programme.rewardAmount - $scope.programme.couponAmount) < 0 ? 0 : ($scope.programme.rewardAmount - $scope.programme.couponAmount);

    programmeServices.getAccountBalance(programme.lotteryCode, programme.rewardAmount, $scope);

    $scope.buySubmit = function(bool){
        if (bool) {
            $state.go('tab.programmerecharge', {backURL: ''})
        } else {
            programmeServices.buyProgramme($scope, programme.programCode, programme.rewardAmount, $stateParams.couponCode, $stateParams.couponAmount)
        }

    }

}])
// 使用优惠券
.controller('UseCouponCtrl', ['$scope', 'globalServices', 'programmeServices', '$stateParams', '$state', function($scope, globalServices, programmeServices, $stateParams, $state) {


        // 默认tab显示的
        $scope.default= {
            index: 0,
            lotteryCode: $stateParams.lotteryCode,
            amount: $stateParams.rewardAmount,

        };
        $scope.couponData = {};
        var sCouponCode, iCouponAmount;

        var noUse = $scope.noUse =  {
            page: 0,
            data: [],
            isMore: true,
            flag: 0
        };

        var used = $scope.used =  {
            page: 0,
            data: [],
            isMore: true,
            flag: 1
        };


        //// 加载数据已使用
        $scope.loadNoUse = function(page, fn){
            programmeServices.getCoupon($scope, 'noUse', page, fn);

        }

        // 下拉刷新未使用
        $scope.doRefreshNoUse = function(){
            $scope.loadNoUse(1, function(){
                $scope.$broadcast('refreshComplete');
            })
        }

        //// 加载数据已使用
        $scope.loadUsed = function(page, fn){
            programmeServices.getCoupon($scope, 'used', page, fn);
        }

        // 下拉刷新已使用
        $scope.doRefreshUsed = function(){
            $scope.loadUsed(1, function(){
                $scope.$broadcast('refreshComplete');
            })

        }



        // 监听default.index变化
        $scope.$watch('default.index', function(newVal, oldVal){

            // 没有变化(第一次进入页面等...)
            if (newVal == oldVal) return;

            switch (newVal) {
                case 0:
                    if (!noUse.page) {
                        $scope.loadNoUse();
                    }
                    break;
                case 1:
                    if (!used.page) {
                        $scope.loadUsed();
                    }
                    break;
            }
        })

        // 选择优惠券
        $scope.selectCoupon = function(couponCode, couponAmount){
            angular.forEach($scope.noUse.data, function(data){

                // 选择当前点击的
                if (data.couponId == couponCode) {
                    data.active = true;
                } else {
                    data.active = false;
                }
            })
            sCouponCode = couponCode;
            iCouponAmount = couponAmount;
        }
        $scope.useCoupon = function(){
            $state.go('tab.programmedetail', {programmeCode: $stateParams.programmeCode, couponCode: sCouponCode, couponAmount: iCouponAmount})
        }

}])
    // 方案订单详情
    .controller('ProgrammeOrderCtrl', ['$scope', 'programmeServices', '$stateParams', function($scope, programmeServices, $stateParams) {

        programmeServices.getOrderDetail($scope, $stateParams.orderCode);

    }])
