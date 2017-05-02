//var serviceModule = require('../../js/serviceModule.js');

/**
 * @date 2016-09-30
 * @auth zhang
 * @tel 15210007185
 */


// 开奖
angular.module('starter.services', []).factory('programmeServices', ['globalServices', '$state', '$ionicPopup', function(globalServices, $state, $ionicPopup){
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
        // 获取方案列表
        programme: (function(){
            var page = 0;

            /**
             * $scope {Object}
             * argPage {Number} 指定加载的页码
             *
             */
            return function($scope, argPage){

                if (!argPage) {
                    page ++;
                } else {
                    page = argPage;
                }

               globalServices.serialPost(2000, 'list', {page: page, pageSizepageSize: 10}).then(function(re){

                   if (re.isOffLine) {
                     $scope.$broadcast('scroll.refreshComplete');
                     $scope.$broadcast('scroll.infiniteScrollComplete');
                     return;
                   }
                   // 没有更多数据了
                   if (re.programList.length < 10) {
                       $scope.isMore = false;
                   }

                   // 直接覆盖数据
                   if (argPage) {
                       $scope.programmes = re.programList;
                       $scope.$broadcast('scroll.refreshComplete')
                   } else {
                       $scope.programmes = $scope.programmes.concat(re.programList);
                       $scope.$broadcast('scroll.infiniteScrollComplete');
                   }
                   globalServices.cache('programme', $scope.programmes);
                });;
            }
        }()),
        /**
         * 根据id获取方案
         * @param id
         * @returns {{}}
         */
        getProgramme: function(id){
            var programme = globalServices.cache('programme'),
                result = {};
            angular.forEach(programme, function(p){

                if (p.programCode == id) {
                    result = p;
                }
            })
            return result;
        },
        /**
         * 获取用户余额及优惠券
         * @param lotteryCode {String} 彩种code
         * @param rewardAmount {Number} 支付的金额
         */
        getAccountBalance: function(lotteryCode, rewardAmount, $scope){

            globalServices.post(3102, 'account', {amount: rewardAmount, lotteryCode: lotteryCode}).then(function(re){
                $scope.account = re;
            })


        },
        /**
         * 购买方案
         * @param programCode {String} 方案id
         * @param amount {Number} 支付金额
         * @param mcoin {Number} 用户余额
         * @param couponCode {String} 优惠券id
         * @param couponAmount {Number} 优惠券金额
         */
        buyProgramme: function($scope, programCode, amount, couponCode, couponAmount){
            $scope.data = {};
            var myPopup = $ionicPopup.show({
                template: '<div><p class="c-333 fs-15" style="margin: 15px 5px; padding-left:15px;border: 1px solid #ddd; border-radius:4px"><my-input><input type="password" id="password" ng-model="data.password" placeholder="登录密码" /></my-input></p><div class="c-red">{{data.wring}}</div></div>',
                title: '请输入您的登录密码',
                scope: $scope,
                buttons: [
                    {text: '取消'},
                    {
                        text: '确定',
                        type: 'c-red',
                        onTap: function (e) {
                            valdatePasswrod($scope.data.password, e);
                            e.preventDefault();
                        }
                    }
                ]
            });


            function valdatePasswrod(password, e){
                globalServices.serialPost(3102, 'password', {password: md5(password)}).then(function(re){


                    if (re.isTrue) {
                        myPopup.close();
                        buySubmit();
                    } else {

                        if (re.errCount == 0) {
                            $scope.data.wring = '您的账户已被锁定！'
                            setTimeout(function(){
                                myPopup.close();
                                $state.go('tab.login', {backURL: 'tab.index'});
                            }, 1000)

                        } else {
                            $scope.data.wring = '密码输入错误，您还有' + re.errCount + '次机会';
                        }
                    }
                })
            }
            function buySubmit(){

                var buyCount = ((amount-couponAmount) < 0 ? '0' : (amount-couponAmount));

                globalServices.serialPost(2000, 'buy', {programCode: programCode, amount: amount, mcoin: buyCount, couponCode: couponCode || '', couponAmount: couponAmount || ''}).then(function(re){
                    $ionicPopup.show({
                        template: '<div class="programme-success"><img src="./img/programme/chenggong.png" /><p>您选择的方案已订购成功<br/>祝您好运</p><style>.popup-body{overflow: visible;padding:0}</style></div>',
                        scope: $scope,
                        buttons: [
                            {text: '取消'},
                            {
                                text: '确定',
                                type: 'c-red',
                                onTap: function (e) {
                                    $state.go('tab.programmeorder', {orderCode: re.orderCode})
                                }
                            }
                        ]
                    });
                })

            }

        },
        /*
         * @param scope {Object} scope对象
         * @tabObj {Object} 当前传递过来的数据
         * @page {String} 指定加载的页码
         * @fn {Function} 回调函数
         */
        getCoupon: function(scope, key, page, fn){

            // 如果不是当前显示的就返回
            if (scope.default.index != scope[key].flag) return;

            if (page) {
                scope[key].page = page;
            } else {
                scope[key].page += 1;
            }

            globalServices.serialPost('3202', 'limitList', {lotteryCode: scope.default.lotteryCode, amount: scope.default.amount, page: scope[key].page, flag: scope[key].flag, pageSize: 10}).then(function(re){

                // 没有返回数据
                if (re.couponList.length < 10) {
                    scope[key].isMore = false;
                }
                scope.$broadcast('scroll.infiniteScrollComplete');

                // 第一页
                if (scope[key].page == 1) {
                    scope[key].data = re.couponList;
                    scope.couponData.canUseSize = re.canUseSize;
                    scope.couponData.cantUseSize = re.cantUseSize;
                    // 下拉刷新时显示无线加载
                    if (re.couponList.length == 10) scope[key].isMore = true;
                } else {
                    scope[key].data = scope[key].data.concat(re.couponList);
                }

                if (fn) fn();
            })
        },
        getOrderDetail: function($scope, orderId){


            globalServices.post(2100, 'detail', {orderCode: orderId}).then(function(re){

                re.order.bonusNumber = globalServices.sliceNum(re.order.bonusNumber);
                $scope.orderDetail = re.order;
            })
        }

    }

}])
