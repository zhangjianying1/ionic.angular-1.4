//var serviceModule = require('../../js/serviceModule.js');

/**
 * @date 2016-10-17
 * @auth zhang
 * @tel 15210007185
 */

angular.module('starter.services', []).factory('userFuncService', ['globalServices', '$state', '$rootScope', '$document', '$compile', function(globalServices, $state, $rootScope, $document, $compile){
    return{


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
