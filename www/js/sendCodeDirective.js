angular.module("starter.directives",[]).directive("sendcode",["$timeout","globalServices",function(e,t){return{restrict:"AE",scope:{mobile:"=",func:"@"},template:'<div class="item item-input" style="z-index:6; overflow: visible"><input type="tel" maxlength="11" ng-maxlength="11" ng-model="mobile" placeholder="请输入你注册时的手机号" required ><a class="assertive-btn small-btn send-btn" ng-class="{disabled: (mobile.length < 11) || !mobile }" ng-click="sendCode($event)" href="">{{btnText}}</a><p class="sended-tips service-tel" ng-show="bBtn">我们已发送了验证码到你的手机</p></div>',link:function(n,i,l){n.btnText="发送验证码",n.bBtn=!1;var r=function(){var t=60;return function(){return t--,0==t?(e.cancel(),n.btnText="发送验证码",void(t=60)):(n.btnText=t+"秒",void e(r,1e3))}}();n.sendCode=function(e){var i=o(n.mobile);i===!0?(n.error="","发送验证码"==n.btnText&&t.serialPost("3104",n.func,{mobile:n.mobile}).then(function(e){n.bBtn=!0,r()},function(e){"use strict";console.log(e)})):n.error=i};var o=function(e,t){var n=/1[3456789]\d{9}/,i=/\S/;return i.test(e)?!!n.test(e)||!t&&"亲，手机号不正确哦":!t&&"亲，手机号不能为空哦"}}}}]);