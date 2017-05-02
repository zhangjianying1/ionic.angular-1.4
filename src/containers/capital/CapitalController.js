//var controllerModule = require('../../js/controllerModule.js');

/**
 * date 2016-10-12
 * auth zhang
 * tel 15210007185
 */
// 充值
angular.module('starter.controllers', []).controller('RechargeCtrl', ['$scope', 'globalServices', function($scope, globalServices) {
    $scope.inputData = {
        amount: 1000,
        rechargeType: 'alipayWap'

    }

    // 选择充值金额
    $scope.selectamountHandle = function(amount){
        $scope.inputData.amount =  amount;
    }

    // 选择充值方式
    $scope.selectRechargeTypeHandle = function(type){
        $scope.inputData.rechargeType =  type;
    }

    // 提交充值请求
    $scope.rechargeSub = function(){



        globalServices.serialPost('3201', $scope.inputData.rechargeType, {amount: $scope.inputData.amount/100, mcoin: $scope.inputData.amount}).then(function(re){

         /// re = {rquestUrl: 'http://115.28.186.127:8080/yb_aliwap_pay/Yb_AliwapPay_Servlet', body: 'fdf'};

          var result = '',
            url = '';

          if ($scope.inputData.rechargeType == 'llfWap') {
            angular.forEach(re, function(val, key){
              result += key  + '=' + val + '&';

            })

            url = 'http://h5.icaimi.com/recharge.html?' + result;
          } else {
            url = re.requestUrl;
          }

          if (window.cordova && cordova.InAppBrowser) {
            var ref = window.open(encodeURI(url), '_system', 'location=yes');
          } else {
            location.href = url;
          }
        })
    }

}])

    // 优惠券
    .controller('CouponCtrl', ['$scope', 'capitalServices', function($scope, capitalServices) {


    // 默认tab显示的
    $scope.default= {
        index: 0
    };

    var noUse = $scope.noUse =  {
        page: 0,
        data: [],
        isMore: true,
        status: 0,
        index: 0
    };

    var used = $scope.used =  {
        page: 0,
        data: [],
        isMore: true,
        status: 2,
        index: 1,
    };

    var overdue = $scope.overdue =  {
        page: 0,
        data: [],
        isMore: true,
        status: 3,
        index: 2
    };

    //// 加载数据已使用
    $scope.loadNoUse = function(page, fn){
        capitalServices.getCoupon($scope, 'noUse', page, fn);

    }

    // 下拉刷新未使用
    $scope.doRefreshNoUse = function(){
        $scope.loadNoUse(1, function(){
            $scope.$broadcast('refreshComplete');
        })
    }

    //// 加载数据已使用
    $scope.loadUsed = function(page, fn){
        capitalServices.getCoupon($scope, 'used', page, fn);
    }

    // 下拉刷新已使用
    $scope.doRefreshUsed = function(){
        $scope.loadUsed(1, function(){
            $scope.$broadcast('refreshComplete');
        })

    }

    //// 加载数据已过期
    $scope.loadOverdue = function(page, fn){
        capitalServices.getCoupon($scope, 'overdue', page, fn);
    }

    // 下拉刷新已使用
    $scope.doRefreshOverdue = function(){
        $scope.loadOverdue(1, function(){
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
            case 2:
                if (!overdue.page) {
                    $scope.loadOverdue();
                }
                break;
        }
    })

}])
    // 账户余额
    .controller('BalanceCtrl', ['$scope', 'globalServices', 'capitalServices', function($scope, globalServices, capitalServices) {
        $scope.mcoin =  globalServices.userBaseMsg.mcoin || 0;
        $scope.default = {
            index: 0
        }

        //  全部
        var all = $scope.all =  {
            page: 0,
            data: [],
            isMore: true,
            status: 0,
            func: 'mcoin',
            cmd: '3200',
        };

        //  充值
        var recharge = $scope.recharge =  {
            page: 0,
            data: [],
            isMore: true,
            status: 1,
            func: 'list',
            cmd: '3201',
        };


        // 加载数据全部
        $scope.loadAll = function(page, fn){

            capitalServices.getCapitalChangeList($scope, $scope.all, page, fn);
        }

        // 下拉刷新全部
        $scope.doRefreshAll = function(){
            $scope.loadAll(1, function(){
                $scope.$broadcast('refreshComplete');
            })

        }
        // 加载数据充值记录
        $scope.loadRecharge = function(page, fn){

            // 加载数据回调函数
            var callback = function(){

                // 缓存充值列表
                capitalServices.rechargeListHandle($scope.recharge.data);

                if (fn) fn();

            }
            capitalServices.getCapitalChangeList($scope, $scope.recharge,  page, callback);
        }

        // 下拉刷新充值记录
        $scope.doRefreshRecharge = function(){
            $scope.loadRecharge(1, function(){

                $scope.$broadcast('refreshComplete');
            })

        }

        // 监听default.index变化
        $scope.$watch('default.index', function(newVal, oldVal){

            // 没有变化(第一次进入页面等...)
            if (newVal == oldVal) return;

            switch (newVal) {
                case 0:
                    if (!all.page) {
                        $scope.doRefreshAll();
                    }
                    break;
                case 1:
                    if (!recharge.page) {
                        $scope.doRefreshRecharge();
                    }
                    break;
                //default:
            }
        })
    }])
    //充值详情
    .controller('RechargeDetailCtrl', ['$scope', 'capitalServices', 'globalServices', '$stateParams', function($scope, capitalServices, globalServices, $stateParams){

        $scope.rechargeData = capitalServices.rechargeListHandle($stateParams.id);

        $scope.mcoin = globalServices.userBaseMsg.mcoin;

    }])
