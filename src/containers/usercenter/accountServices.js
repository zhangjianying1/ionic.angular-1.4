/**
 * @date 2016-09-30
 * @auth zhang
 * @tel 15210007185
 */
angular.module('starter.servies', []).factory('accountService', ['globalServices', '$state', '$rootScope', '$document', '$compile', function(globalServices, $state, $rootScope, $document, $compile){
    return{
        getAccount: function($scope){

          $scope.accountInfo = globalServices.userBaseMsg;

            globalServices.post('3102', 'member', {})
                .then(function(re) {
                    $scope.accountInfo = re;
                    $scope.$broadcast('scroll.refreshComplete');
                    // 更新用户信息
                    globalServices.setUserBaseMsg(angular.extend({token: globalServices.userBaseMsg.token}, re));
                    globalServices.localStorageHandle('account', {"mobile": re.mobile, "password":  globalServices.localStorageHandle('account').password});
                }, function(msg){
                    $scope.$broadcast('scroll.refreshComplete');
                })
        },
        // 设置用户名
        setMemberName: function(memberName){
            globalServices.serialPost('3103', 'memberName', {memberName: memberName}).then(function(re){

                // 更新用户信息
                globalServices.setUserBaseMsg(angular.extend(globalServices.userBaseMsg, {memberName: memberName}))
                $state.go('tab.usermsg');
            })
        },
        // 绑定手机号
        bindMobile: function(mobile){
            globalServices.serialPost('3103', 'mobile', {mobile: mobile}).then(function(re){

                // 修改缓存用户信息（手机号已绑定）
                globalServices.setUserBaseMsg(angular.extend({mobile: mobile}, globalServices.userBaseMsg))
                $state.go('tab.usermsg', null, {reload: true});
            })
        },

        // 修改密码
        modifyPassword: function(data){

            var password = md5(data.password),
                oldPassword = md5(data.oldPassword);

            if (data.password == data.repeatPassword) {
                globalServices.serialPost('3103', 'password', {password: password, oldPassword: oldPassword}).then(function(re){

                    globalServices.localStorageHandle('account', {mobile: globalServices.userBaseMsg.mobile, password: password})
                    $state.go('tab.usermsg');
                })
            }

        },
        // 设置密码
        setPassword: function(data){

            data.mobile = globalServices.userBaseMsg.mobile;
            var password = md5(data.password);

            if (data.password != data.repeatPassword) return;
            globalServices.serialPost('3103', 'resetPassword', {mobile: data.mobile, password: password}).then(function(re){
                globalServices.localStorageHandle('account', {"mobile": data.mobile, "password": password})
                // 修改缓存用户信息（密码已设置）
                globalServices.setUserBaseMsg(angular.extend(globalServices.userBaseMsg, {setPassword: 1}))
                $state.go('tab.usermsg');
            })

        },
        /**
         * 获取订单列表
         * @param $scope
         * @returns {Function}
         */
        orderList: function($scope){
            var page = 0;

            return function(argPage){

                if (argPage) {
                    page = 0;
                }
                page += 1;

                globalServices.serialPost('2100', 'list', {page: page, pageSize: 20}).then(function(re){

                    if (!argPage) {
                        $scope.orders = $scope.orders.concat(re.orderList);
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    } else {
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.isMore = true;
                    }

                    if (re.itemTotal < 15) {
                        $scope.isMore = false;
                    }
                })
            }


        },
        // 分享
        share: function(params){
            var html = '<div class="share-layer" ng-click="closeLayer()"><div class="row"> <div class="col" ng-click="shareHandle(1)"><img src="./img/usercenter/bt_weixin.png" /><br/>微信</div>' +
                '<div class="col" ng-click="shareHandle(2)"><img src="./img/usercenter/bt_pengyouquan.png" />' +
                '<br/>朋友圈</div><div class="col" ng-click="shareHandle(3)"><img src="./img/usercenter/bt_weibo.png" /><br/>微博</div></div></div>';


            var dom = angular.element(html);
            var scope = $rootScope.$new();
            angular.extend(scope, {
                closeLayer: function(){
                    "use strict";
                    dom.remove();
                },
                shareHandle: params.shareHandle
            });
            $document.find('body').append(dom);

            $compile(dom)(scope);


        }

    }
}])
