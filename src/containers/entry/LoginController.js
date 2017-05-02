//var controllerModule = require('../../js/controllerModule.js');
/*
 * date 2016-9-26
 * auth zhang
 * tel 15210007185
 *
 * 入口控制
 */

// 登录
angular.module('starter.controllers', []).controller('LoginCtrl', ['$scope', 'entryServices', '$ionicPopup', '$stateParams', '$ionicHistory', '$state', '$rootScope',
    function($scope, entryServices, $ionicPopup, $stateParams, $ionicHistory, $state, $rootScope) {

    $scope.inputData = {};
    $scope.isShow = true;


    var storyView = $ionicHistory.backView() || {},
        backURL,
        ele = entryServices.setHeader({
        back: function(){

            if (backURL = $stateParams.backURL) {
                $state.go(backURL);
            } else {
                $ionicHistory.goBack();
            }

        },
        isShow: $scope.isShow
    });
    $scope.$on('$destroy',function(){
        ele.remove();

    })
    // 登录
    $scope.loginSub = function(){
        entryServices.signIn($scope.inputData, $stateParams.backURL);
    }

    $scope.unionLogin = function(msg){

        var pop = $ionicPopup.show({

            template: '<div class="union-popup"><p class="fs-14">如果您已注册过彩米账号，输入密码即可关联到此账号。</p>' +
            '<label class="item item-input password-input"><em><span>账户:</span></em><input type="text"  ng-model="userName" placeholder="手机号/用户名" required>' +
            '</label><pass-word style="margin-bottom: 3px;" password="password" placeholder="请输入密码">密码:</pass-word><p class="c-red fs-13">密码错误，请重新输入</p></div>',
            title: '是否关联已注册过的彩米账号',
            scope: $scope,
            buttons: [
                { text: '不关联登陆' },
                {
                    text: '<b>关联并登录</b>',
                    type: 'c-red',
                    onTap: function(e) {

                        setTimeout(function(){
                            pop.close();
                        }, 1000)
                        e.preventDefault();
                    }
                },
            ]
        });

    }


}])
    // 注册
    .controller('RegisterCtrl', ['$scope', '$location', 'entryServices', function($scope, $location, entryServices) {

    $scope.inputData = {}

    $scope.formSub = function(){
        entryServices.createAccount($scope.inputData);
    }

}])
    // 忘记密码(发送手机和验证码验证)
    .controller('ForgetPasswordCtrl', ['$scope', '$location', 'entryServices', '$stateParams', function($scope, $location, entryServices, $stateParams) {

        $scope.inputData = {};

        $scope.formSub = function(){
            // 指定自己要跳转的页面的路由域
            entryServices.forgetPassword($scope.inputData, $stateParams.scopeURL);
        }

    }])
    // 验证成功后重设密码
    .controller('ResetPasswordCtrl', ['$scope', 'globalServices', 'entryServices', '$stateParams', function($scope, globalServices, entryServices, $stateParams) {

        $scope.inputData = {
            mobile: $stateParams.mobile
        };
        $scope.formSub = function() {
            if ($scope.inputData.password == $scope.inputData.repeatPassword) {
                entryServices.resetPassword($scope.inputData, 'tab.login');
            }
        }

    }])
