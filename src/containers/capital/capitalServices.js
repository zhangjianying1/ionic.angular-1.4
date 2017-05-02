//var serviceModule = require('../../js/serviceModule.js');

angular.module('starter.services', []).factory('capitalServices', ['globalServices', function(globalServices){

    return {

        // 充值记录列表
        rechargeList: [],

        // 处理充值列表
        rechargeListHandle: function(param){

            var result;

            // 是数据
             if (angular.isArray(param)) {
                 this.rechargeList = param;
             } else {
                 angular.forEach(this.rechargeList, function(recharge, index){

                     if (recharge.orderId == param) {
                         result = recharge;
                     }
                 })
             }
            return result;

        },
        /*
         * @param scope {Object} scope对象
         * @tabObj {Object} 当前传递过来的数据
         * @page {String} 指定加载的页码
         * @fn {Function} 回调函数
         */
        getCoupon: function(scope, key, page, fn){

            // 如果不是当前显示的就返回
            if (scope.default.index != scope[key].index) return;

            if (page) {
                scope[key].page = page;
            } else {
                scope[key].page += 1;
            }

            globalServices.serialPost('3202', 'list', {page: scope[key].page, status: scope[key].status}).then(function(re){

                // 没有返回数据
                if (re.couponList.length < 10) {
                    scope[key].isMore = false;
                }
                scope.$broadcast('scroll.infiniteScrollComplete');
                // 第一页
                if (scope[key].page == 1) {
                    scope[key].data = re.couponList;
                    // 下拉刷新时显示无线加载
                    if (re.couponList.length == 10) scope[key].isMore = true;
                } else {
                    scope[key].data = scope[key].data.concat(re.couponList);

                }



                if (fn) fn();
            })
        },
        /**
         *
         * @param scope {Object} 传递的scope对象
         * @param tabObj {Object} 当前tab传递的对象
         * @param func {String} 请求的地址
         * @param page {String} 请求的页码
         * @param fn {Function} 回调函数
         */
        getCapitalChangeList: function(scope, tabObj, page, fn){

            // 如果不是当前显示的就返回
            if (scope.default.index != tabObj.status) return;

            if (page) {
                tabObj.page = page;
            } else {
                tabObj.page += 1;
            }



            globalServices.serialPost(tabObj.cmd, tabObj.func, {page: tabObj.page}).then(function(re){

                var resultData = re.fillList || re.accountLogList;

                // 没有返回数据
                if (resultData.length < 10) {
                    tabObj.isMore = false;
                }
                // 第一页
                if (tabObj.page == 1) {
                    tabObj.data = resultData;

                    // 下拉刷新时显示无线加载
                    if (resultData.length == 10) tabObj.isMore = true;

                } else {
                    tabObj.data = tabObj.data.concat(resultData);

                }
                scope.$broadcast('scroll.infiniteScrollComplete');


                if (fn) fn();

            })
        }
    }
}])
