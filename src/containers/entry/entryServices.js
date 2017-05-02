/**
 *
 * 2016-09-28
 * @auth zhang
 * @tel 15210007185
 * 入口服务
 */
angular.module('starter.services', []).factory('entryServices', ['globalServices', '$state', '$rootScope', '$document', '$compile', function(globalServices, $state, $rootScope, $document, $compile){

    return {
        setHeader: function(data){

            var html = '<div class="login-header"><div on-tap="back()"><i class="ion ion-ios-arrow-back"></i></div></div>'

            var ele = angular.element(html),
                scope = $rootScope.$new();

            angular.extend(scope, {
                back: function(){
                    data.back();
                    ele.remove();

                }
            });
            $document.find('body').append(ele);
            $compile(ele)(scope);
            return ele;

        },
        // 登录
        signIn: function(data, backURL){
            var password = md5(data.password);

            globalServices.signIn({mobile: data.mobile, password: password}, function(re){

                if (re.token) {

                    // 缓存用户的账号信息（自动登录用）
                    globalServices.localStorageHandle('account', {mobile: data.mobile, password: password})
                    globalServices.setUserBaseMsg(re);
                    backURL = backURL ? backURL : 'tab.account';
                    $state.go(backURL);
                } else {
                    if (re.errCount > 0) {
                        globalServices.errorPrompt('用户名或密码错误');
                    } else if (re.errCount == 0) {
                        globalServices.errorPrompt('用户已被锁定');

                    }
                }

            })
        },

        // 注册
        createAccount: function (data) {
            var password = md5(data.password);

            if (data.password == data.repeatPassword) {
                globalServices.serialPost('3100', 'mobile', {mobile: data.mobile, testCode: data.testCode, password: password}).then(function (re) {
                    globalServices.setUserBaseMsg(re);
                    globalServices.localStorageHandle('account', {mobile: data.mobile, password: password})
                    $state.go('tab.account');
                })
            }

        },
        /**
         * 忘记密码（发送验证码）
         * @params data {Object} 电话号码和验证码
         * @params scopeURL {String} 当前的路由域
         */

        forgetPassword: function(data, scopeURL){

            // 如果有指定路由域
            scopeURL = scopeURL ? 'tab.accountresetpassword' : 'tab.resetpassword';

            globalServices.serialPost('3105', 'forgetPassword', data).then(function(re){
                $state.go(scopeURL, {mobile: data.mobile})
            })
        },

        // 重置密码
        resetPassword: function(data, backURL){
            var password = md5(data.password);
            globalServices.serialPost('3103', 'resetPassword', {mobile: data.mobile, password: password}).then(function(re){
                $state.go(backURL);
            })

        }
    }

}])
