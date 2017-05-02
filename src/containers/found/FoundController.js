//var controllerModule = require('../../js/controllerModule.js');
/**
 * @date 2016-11-18
 * @auth zhang
 * @tel 15210007185
 */


// 发现首页
angular.module('starter.controllers', []).controller('FoundCtrl', ['$scope', 'globalServices', 'foundServices', function($scope, globalServices, foundServices) {
    $scope.bouns = {};


    foundServices.getBouns($scope);


}])
    // 资讯
    .controller('ConsultCtrl', ['$scope', 'globalServices', 'foundServices', function($scope, globalServices, foundServices) {
        $scope.consults = globalServices.cache('consults', 10) || [];
        $scope.$on('$ionicView.beforeEnter', function(){
            $scope.isMore = true;
            var getConsult = foundServices.consult($scope);
            $scope.loadMore = function(){
                getConsult();
            }
            $scope.doRefresh = function() {
                getConsult(1);
            }


        })
        $scope.$on('$ionicView.afterEnter', function(){
          $scope.$broadcast('loadImg');
        });

    }])
    // 资讯详情
    .controller('ConsultDetailCtrl', ['$scope', 'globalServices', 'foundServices', '$stateParams', function($scope, globalServices, foundServices, $stateParams) {
        $scope.consultDetail = {};
        $scope.consultDetail = globalServices.cache('consults', $stateParams.id);
        foundServices.getConsultByCode($scope,  $stateParams.id);
    }])
    // 公告
    .controller('NoticeCtrl', ['$scope', 'globalServices', 'foundServices', function($scope, globalServices, foundServices) {
        $scope.default = {
            index: 0
        }

        var notice = foundServices.notice($scope);
        var receiveNotice = foundServices.receiveNotice($scope);
        $scope.selfNotice = {
            doRefresh: function(){
                notice(1);

            },
            loadMore: function(){
                notice();
            },
            isMore: true,
            data: [],
            index: 0,
        }
        $scope.pushNotice = {
            doRefresh: function(){
                receiveNotice(1);

            },
            loadMore: function(){
                receiveNotice();
            },
            isMore: true,
            data: [],
            index: 1
        }
        $scope.selfNotice.data = globalServices.cache('notices', 10) || [];

        // 监听default.index变化
        $scope.$watch('default.index', function(newVal, oldVal){

            // 没有变化(第一次进入页面等...)
            if (newVal == oldVal) return;

            switch (newVal) {
                case 0:
                    if (!$scope.selfNotice.page) {
                        notice(1);
                    }
                    break;
                case 1:
                    if (!$scope.pushNotice.page) {
                        receiveNotice(1);
                    }
                    break;
            }
        })
    }])
    // 公告详情
    .controller('NoticeDetailCtrl', ['$scope', 'globalServices', 'foundServices', '$stateParams', function($scope, globalServices, foundServices, $stateParams) {

        // 推送详情页
        if ($stateParams.push) {
            foundServices.getPushNoticeByCode($scope, $stateParams.id);
        } else {
            $scope.noticeDetail = {};
            $scope.noticeDetail = globalServices.cache('notices', $stateParams.id);
            foundServices.getNoticeByCode($scope,  $stateParams.id);
        }



    }])



