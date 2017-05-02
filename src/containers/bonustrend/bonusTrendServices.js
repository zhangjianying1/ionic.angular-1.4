//var servicesModule = require('../../js/serviceModule.js');

/**
 *
 * 2016-10-20
 * @auth zhang
 * @tel 15210007185
 * 入口服务
 */


angular.module('starter.services', []).factory('bonusTrendServices', ['globalServices', '$stateParams', '$rootScope', function(globalServices, $stateParams, $rootScope){
    "use strict";
    return{
        issueData: {},
        /**
         * 缓存数据
         * @param sign {String}数据的key
         * @param data {Array} 数组数据
         * @param isClean {Boolean} 是否先清除数据
         */
        issueDataHandle: function(sign, data, isClean){

            if (data) {
                // 清除数据(重新缓存)
                if (isClean) {
                    this.issueData[sign] = [];
                }
                if (angular.isArray(this.issueData[sign])) {
                    this.issueData[sign] = this.issueData[sign].concat(data);
                } else {
                    this.issueData[sign] = data;
                }

            } else {

                return this.issueData[sign] || [];
            }

        },
        issue: {},
        issueHandle: function(sign, issue){

            this.issue[sign] = issue;
        },
        bBtn: true,
        bonusIssue: function(sign, $scope){

            var This = this,
                startI = 0;

            return function(index, isRefersh, fn){



                if (isRefersh) {
                    This.issueHandle(sign, '');
                }

                globalServices.serialPost(4001, 'number', {lotteryCode: $stateParams.id, issue: (This.issue[sign] || ''), pageSize: 20}).then(function(re){

                    // 有数据
                    if (re.issueList.length > 0) {

                        This.issueDataHandle(sign, re.issueList, isRefersh);

                        This.issueHandle(sign, getLastIssue(re.issueList))


                    }

                    // 没有数据或最后一页的时候
                    if (re.issueList.length < 20){
                      dataHandle(re.issueList, 'nothing');
                      //dataHandle(This.issueData[sign], 'nothing');
                    } else {
                      dataHandle(re.issueList);
                      //dataHandle(This.issueData[sign]);
                    }

                    //$scope.$broadcast('drawChart', This.issueData[sign]);

                });


            }
          /**
           * 处理七乐彩数据
           * @param data
           */
            function changeData(data){
              angular.forEach(data, function(issue){
                angular.forEach([1,2,3], function(num, i){
                  issue.yiLou['def' + num] = issue.yiLou.def.slice(i*10,i*10+10);
                })

              })
            }
            /**
             * 处理十一选五数据
             * @param data
             */
            function change115Data(data){


              angular.forEach(data, function(issue){

                issue.issue = issue.issue.slice(-6);
                angular.forEach(issue.yiLou, function(val, key){

                  // 如果是前三
                  if (/three\d/.test(key)) {
                    if (!angular.isArray(issue.yiLou['three'])) {
                      issue.yiLou['three'] = [];
                    }
                    issue.yiLou['three'] = issue.yiLou['three'].concat(val);
                  }

                  // 如果是前二
                  if (/two\d/.test(key)) {

                    if (!angular.isArray(issue.yiLou['two'])) {
                      issue.yiLou['two'] = [];
                    }
                    issue.yiLou['two'] = issue.yiLou['two'].concat(val);
                  }
                })




              })
            }
            function dataHandle(data, isNothing){

                // 七乐彩数据重构
                if ($scope.default.signHC == '7LC') {
                  changeData(data);
                }

                if ($scope.default.signHC == '115') {
                  change115Data(data);
                }
                $scope.issueList = data;
                $rootScope.chart = 'chart';

                // 没有数据了
                if (isNothing) {
                  $scope.isMore = false;
                }

            }
            function getLastIssue(issueData){
                return issueData.slice(-1)[0].issue;
            }
            function hasIssue(issueStr){
                var bool = false;

                angular.forEach(This.issueData[sign], function(issue, index){

                    if (issue.issue == issueStr) {

                        bool = true;
                    }
                })
                return bool;
            }



        },
        chartSum: function(lotteryCode){
                return globalServices.post(4001, 'numberCount', {lotteryCode: lotteryCode});
        },
        chartKSGroup: function($stateParams, $scope, sign){

          var This = this;

          globalServices.serialPost(4001, 'k3', {lotteryCode: $stateParams.id}).then(function(re){

            // 有数据
            if (re.dataList.length > 0) {

              $scope.groupData = re.dataList;
              This.issueDataHandle(sign, re.dataList, true);
              $rootScope.chart = 'chart';
              $scope.isMoreGroup = false;
            }

          });
        },
        // 根据lotteryCode 得到彩种名称
        getLotteryName: function(lotteryCode){

          var lotteryName;

          switch (lotteryCode) {

            case '001':
              lotteryName = '双色球';
              break;
            case '002':
              lotteryName = '福彩3D';
              break;
            case '113':
              lotteryName = '大乐透';
              break;
            case '108':
              lotteryName = '排列三';
              break;
            case '109':
              lotteryName = '排列五';
              break;
            case '004':
              lotteryName = '七乐彩';
              break;
            case '110':
              lotteryName = '七星彩';
              break;
            case '011':
              lotteryName = '江苏快三';
              break;
            case '010':
              lotteryName = '安徽快三';
              break;
            case '018':
              lotteryName = '北京快三';
              break;
            // default:
          }
          return lotteryName;

        }
    }
}])
