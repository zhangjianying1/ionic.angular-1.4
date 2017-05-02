angular.module("starter.controllers",[]).controller("RechargeCtrl",["$scope","globalServices",function(e,a){e.inputData={amount:1e3,rechargeType:"alipayWap"},e.selectamountHandle=function(a){e.inputData.amount=a},e.selectRechargeTypeHandle=function(a){e.inputData.rechargeType=a},e.rechargeSub=function(){a.serialPost("3201",e.inputData.rechargeType,{amount:e.inputData.amount/100,mcoin:e.inputData.amount}).then(function(a){var o="",t="";if("llfWap"==e.inputData.rechargeType?(angular.forEach(a,function(e,a){o+=a+"="+e+"&"}),t="http://h5.icaimi.com/recharge.html?"+o):t=a.requestUrl,window.cordova&&cordova.InAppBrowser){window.open(encodeURI(t),"_system","location=yes")}else location.href=t})}}]).controller("CouponCtrl",["$scope","capitalServices",function(e,a){e.default={index:0};var o=e.noUse={page:0,data:[],isMore:!0,status:0,index:0},t=e.used={page:0,data:[],isMore:!0,status:2,index:1},n=e.overdue={page:0,data:[],isMore:!0,status:3,index:2};e.loadNoUse=function(o,t){a.getCoupon(e,"noUse",o,t)},e.doRefreshNoUse=function(){e.loadNoUse(1,function(){e.$broadcast("refreshComplete")})},e.loadUsed=function(o,t){a.getCoupon(e,"used",o,t)},e.doRefreshUsed=function(){e.loadUsed(1,function(){e.$broadcast("refreshComplete")})},e.loadOverdue=function(o,t){a.getCoupon(e,"overdue",o,t)},e.doRefreshOverdue=function(){e.loadOverdue(1,function(){e.$broadcast("refreshComplete")})},e.$watch("default.index",function(a,r){if(a!=r)switch(a){case 0:o.page||e.loadNoUse();break;case 1:t.page||e.loadUsed();break;case 2:n.page||e.loadOverdue()}})}]).controller("BalanceCtrl",["$scope","globalServices","capitalServices",function(e,a,o){e.mcoin=a.userBaseMsg.mcoin||0,e.default={index:0};var t=e.all={page:0,data:[],isMore:!0,status:0,func:"mcoin",cmd:"3200"},n=e.recharge={page:0,data:[],isMore:!0,status:1,func:"list",cmd:"3201"};e.loadAll=function(a,t){o.getCapitalChangeList(e,e.all,a,t)},e.doRefreshAll=function(){e.loadAll(1,function(){e.$broadcast("refreshComplete")})},e.loadRecharge=function(a,t){var n=function(){o.rechargeListHandle(e.recharge.data),t&&t()};o.getCapitalChangeList(e,e.recharge,a,n)},e.doRefreshRecharge=function(){e.loadRecharge(1,function(){e.$broadcast("refreshComplete")})},e.$watch("default.index",function(a,o){if(a!=o)switch(a){case 0:t.page||e.doRefreshAll();break;case 1:n.page||e.doRefreshRecharge()}})}]).controller("RechargeDetailCtrl",["$scope","capitalServices","globalServices","$stateParams",function(e,a,o,t){e.rechargeData=a.rechargeListHandle(t.id),e.mcoin=o.userBaseMsg.mcoin}]);