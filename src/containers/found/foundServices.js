//var serviceModule = require('../../js/serviceModule.js');

/**
 * @date 2016-11-18
 * @auth zhang
 * @tel 15210007185
 */

// 开奖
angular.module('starter.services', []).factory('foundServices', ['globalServices', '$sce', function(globalServices, $sce) {
    return {
        /**
         * 请求数据返回处理函数
         * @param $scope {Object}
         * @param argPage {Number} 如果是下拉刷新
         * @param currentPage {Number} 当前页码
         * @param data {Array} 缓存的数据
         * @param cacheId {String} 缓存的key

         * @param limit {Number} 数据最大条数
         */
        responseDataHandle: function($scope, argPage, currentPage, data, cacheId, limit){

            if (data.isOffLine) {
              $scope.$broadcast('scroll.refreshComplete');
              $scope.$broadcast('scroll.infiniteScrollComplete');
              return;
            }

            if (currentPage == 1) {

                $scope[cacheId] = data;
                $scope.isMore = true;
                $scope.$broadcast('scroll.refreshComplete')
            } else {
                $scope[cacheId] =  $scope[cacheId].concat(data);


            }
            if (data.length < 10) {
              $scope.isMore = false;
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');

            // 缓存咨询数据
            globalServices.cache(cacheId, data);

        },
        getBouns: function($scope){
            globalServices.post('4000', 'last').then(function(re){
                re.issue.bonusNumber = globalServices.sliceNum(re.issue.bonusNumber);
                $scope.bonus = re.issue;
            });
        },
        /**
         * 取缓存数据的指定数据
         * @param cacheId {String}
         * @param id
         * @returns {Array}
         */
        getDateById: function(cacheId, id){
            var reData = globalServices.cache(cacheId),
                result = [];

            angular.forEach(reData, function(data){

                if (data.id == id) {
                   result = data;
                }
            })
            return result;

        },
        /**
         * 获取资讯数据列表
         * @param $scope
         * @returns {Function}
         */
        consult: function($scope){

            var page = 0,
                This = this;

            return function(argPage){

                if (argPage) {
                    page = argPage;
                } else {
                    page += 1;
                }

                globalServices.serialPost('5000', 'newsList', {page: page, pageSize: 10}).then(function(re){
                    This.responseDataHandle($scope, argPage, page, re.newsList, 'consults', 10);

                });
            }

        },
        /**
         * 获取资讯详情
         * @param $scope
         * @param articleCode
         * @returns {Function}
         */
        getConsultByCode: function($scope, articleCode){

            globalServices.post('5000', 'newsDetail', {articleCode: articleCode}).then(function(re){

                if (re.news && re.news.content) {
                  re.news.content = $sce.trustAsHtml(re.news.content);
                }

                $scope.consultDetail = re && re.news;
            });
        },
        /**
         * 获取公告数据列表
         * @param $scope
         * @returns {Function}
         */
        notice: function($scope){
            var page = 0,
                This = this;

            return function(argPage){

                if ($scope.default.index !== $scope.selfNotice.index) return;

                if (argPage) {
                    page = argPage;
                } else {
                    page += 1;
                }

                globalServices.serialPost('5000', 'noticeList', {page: page, pageSize: 10}).then(function(re){

                    if (argPage){
                        $scope.selfNotice.isMore = true;
                        $scope.$broadcast('refreshComplete');
                    }

                    if ((re.noticeList.length < 10) && (page == 1)) {
                        $scope.selfNotice.isMore = false;
                        $scope.selfNotice.data = re.noticeList;
                    } else {
                        $scope.selfNotice.data =  $scope.selfNotice.data.concat(re.noticeList);
                    }
                    // 缓存咨询数据
                    globalServices.cache('notices', re.noticeList);
                });

            }

        },
        /**
         * 接收消息
         * @param $scope
         * @returns {Function}
         */
        receiveNotice: function($scope){
            var page = 0,
                This = this;

            return function(argPage){

                if ($scope.default.index !== $scope.pushNotice.index) return;

                if (argPage) {
                    page = 0;
                    $scope.selfNotice.isMore = true;
                    $scope.$broadcast('refreshComplete');
                }

                var result = globalServices.localStorageHandle({key: 'notices', page: page, pageSize: 10}) || [];

                angular.forEach(result, function(re){
                    // 时间序列化
                    re.createTime = This.timeHandle(re.createTime);
                })
                page += 1;

                if (page == 1) {
                    $scope.pushNotice.data = result;

                    if (result.length < 10) {
                        $scope.pushNotice.isMore = false;
                    }
                } else {
                    $scope.pushNotice.data =  $scope.pushNotice.data.concat(result);

                }
                $scope.$broadcast('scroll.infiniteScrollComplete');



            }

        },
        /**
         * 获取公告详情
         * @param $scope
         * @param noticeCode
         * @returns {Function}
         */
        getNoticeByCode: function($scope, noticeCode){

            globalServices.post('5000', 'noticeDetail', {noticeCode: noticeCode}).then(function(re){
                $scope.noticeDetail = re.notice;
            });
        },
        /**
         * 获取推送消息
         * @param $scope {Object}
         * @param pushNoticeCode {Number}
         * @returns {Object}
         */
        getPushNoticeByCode: function($scope, pushNoticeCode){
            var result = globalServices.localStorageHandle('notices');

            angular.forEach(result, function(obj){

                if (obj.pushNoticeCode == pushNoticeCode) {
                    $scope.noticeDetail = obj;
                }
            })


        },
        /**
         * 时间处理
         * @param time
         */
        timeHandle: function(time) {
            var oTimeDate = new Date(time),
                oDate = new Date(),
                todayTimes = oDate.getHours() * 3600;

            // 今天
            if ((oDate.getTime() - oTimeDate.getTime()) < todayTimes) {
                return oTimeDate.getHours() + ':' + oTimeDate.getMinutes();
            } else {
                return (oTimeDate.getMonth() + 1) + '/' + oTimeDate.getDate();
            }

        }
    }
}])
