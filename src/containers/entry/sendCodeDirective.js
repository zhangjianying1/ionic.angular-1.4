//var directiveModule = require('../../js/directiveModule.js');

/**
 * 2016-9-22
 * @auth zhang
 * @tel 15210007185
 */


// 发送验证码
angular.module('starter.directives', []).directive('sendcode', ['$timeout', 'globalServices', function($timeout, globalServices){

    return {
        restrict: 'AE',
        scope: {
            mobile: '=',
            func: '@'
        },
        template: '<div class="item item-input" style="z-index:6; overflow: visible"><input type="tel" maxlength="11" ng-maxlength="11" ng-model="mobile" placeholder="请输入你注册时的手机号" required >' +
            '<a class="assertive-btn small-btn send-btn" ng-class="{disabled: (mobile.length < 11) || !mobile }" ng-click="sendCode($event)" href="">{{btnText}}</a>' +
            '<p class="sended-tips service-tel" ng-show="bBtn">我们已发送了验证码到你的手机</p></div>',
        link: function(scope, ele, attrs){
            scope.btnText = '发送验证码';
            scope.bBtn = false;
            var countDown = (function(){
                var time = 60;

                return function(){
                    time --;
                    if (time == 0) {
                        $timeout.cancel();
                        scope.btnText = '发送验证码';
                        time = 60;
                        return;
                    } else {
                        scope.btnText = time + '秒';
                    }
                    $timeout(countDown, 1000);
                }
            }());

            scope.sendCode = function($event){
                var re = velidatePhone(scope.mobile);

                if (re === true) {
                    scope.error = '';

                    if (scope.btnText == '发送验证码'){

                        globalServices.serialPost('3104', scope.func, {mobile: scope.mobile}).then(function(re){

                            scope.bBtn = true;
                            countDown();

                        }, function(re){
                            "use strict";
                            console.log(re)
                        });
                    }
                } else {
                    scope.error = re;
                }

            };
            var velidatePhone = function(mobile, bool){
                var re = /1[3456789]\d{9}/,
                    re2 = /\S/;
                //为空
                if (!re2.test(mobile)) {

                    if (bool) return false;
                    return '亲，手机号不能为空哦';
                } else {
                    if (re.test(mobile)) {
                        return true;
                    } else {

                        if (bool) return false;
                        return '亲，手机号不正确哦';
                    }
                }
            };
            var velidateCode = function(){
                var re = /^[0-9]{6}$/,
                    re2 = /\S/;
                //为空
                if (!re2.test(scope.code)) {
                    return '亲，验证码不能为空哦';
                } else {
                    if (re.test(scope.code)) {
                        return true;
                    } else {
                        return '亲，验证码不正确哦';
                    }
                }
            };



        }
    }
}])
