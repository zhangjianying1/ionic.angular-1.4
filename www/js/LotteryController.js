angular.module("starter.controllers",[]).controller("LotteryCtrl",["$scope","lotteryServices","globalServices",function(t,e,o){t.lotterys=[],t.lotterys=o.localStorageHandle("lottery"),t.$on("$ionicView.afterEnter",function(){e.lottery(t)}),t.doRefresh=function(){e.lottery(t)}}]).controller("LotteryListCtrl",["$scope","globalServices","lotteryServices","$stateParams",function(t,e,o,r){t.pathName=unit.getPattren(location.hash,/#\/tab\/(\w+)lotterylist/),t.lotteryList=[],t.lotteryCode=r.id;var l=o.LotteryBonus(t.lotteryCode);t.$on("$ionicView.afterEnter",function(){t.isMore=!0,t.doRefresh=function(){t.loadMore(1,function(){t.$broadcast("scroll.refreshComplete")})},t.loadMore=function(o,r){l(o).then(function(l){return l.isOffLine?(t.$broadcast("scroll.refreshComplete"),void t.$broadcast("scroll.infiniteScrollComplete")):(l.issueList<10&&(t.isMore=!1),!o&&t.lotteryList.length?t.lotteryList=t.lotteryList.concat(e.serializeLottery(l.issueList)):t.lotteryList=e.serializeLottery(l.issueList),t.lotteryTitle=t.lotteryList[0].lotteryName,void(r?r():t.$broadcast("scroll.infiniteScrollComplete")))})}})}]);