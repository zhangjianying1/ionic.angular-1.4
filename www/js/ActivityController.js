angular.module("starter.controllers",[]).controller("SignCtrl",["$scope","globalServices","activityServices",function(i,t,a){var c=!0;i.signData={activityPrizeList:[0,1,2,3,4,5]},i.count=-1,a.getActivity(i),i.againOnce=function(){c=!0,i.signData={activityPrizeList:[0,1,2,3,4,5]}},i.signHandle=function(t){0!=i.count&&0!=c&&(c=!1,a.receiveSign(i.activityId).then(function(a){var c,n=a.activity.activityPrizeList;angular.forEach(n,function(i,t){i.prizeValue==a.activity.prizeValue&&(c=n.splice(t,1))}),n.splice(t,0,c[0]),i.signData=a.activity,i.active=t,i.count--}))}}]);