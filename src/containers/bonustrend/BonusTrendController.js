
/**
 * 彩种走势
 * date 2016-10-20
 * auth zhang
 * tel 15210007185
 */

/**
 * lotteryCode 001 => 双色球
 * lotteryCode 002 => 福彩3D
 * lotteryCode 113 => 大乐透
 * lotteryCode 108 => 排列三
 * lotteryCode 109 => 排列五
 * lotteryCode 004 => 七乐彩
 * lotteryCode 110 => 七星彩
 * lotteryCode 018 => 北京快三
 * lotteryCode 011 => 江苏快三
 * lotteryCode 010 => 安徽快三
 * lotteryCode 110 => 七星彩
 * lotteryCode 110 => 七星彩
 */

//
angular.module('starter.controllers', []).controller('BonusTrendCtrl', ['$scope',  '$stateParams', 'bonusTrendServices',
    function($scope,  $stateParams, bonusTrendServices) {


          // 默认tab显示的
          $scope.default = {
              index: 0,  // tab 显示的索引
              pickerVal: 0,
              issueNum: [],
              lotteryCode: $stateParams.id,
              remnantW: document.documentElement.clientWidth-60,
          }

          $scope.issueList = [];


          // 页面的title
          $scope.bonusTitle = bonusTrendServices.getLotteryName($stateParams.id);

          $scope.$watch('default.index', function (newVal, oldVal) {
              if (newVal == oldVal) return;
              $scope.$broadcast('hideMore')

          })

          var sign;

          $scope.$watch('default.pickerVal', function (newVal, oldVal) {

              if (newVal == oldVal) return;
              $scope.$broadcast('hideMore');

          });

          // 滚动加载
          $scope.$on('loadMore', function(){
              $scope.loadMore();
          });
          switch ($stateParams.id) {
              case '001':
                  $scope.default.signHC = 'SSQ';
                  $scope.default.digitArr = new Array(33);
                  break;
              case '002':

                  $scope.default.signHC = '3D';
                  break;
              case '113':
                  $scope.default.digitArr = new Array(35);
                  $scope.default.signHC = 'DLT';
                  break;
              case '108':

                  $scope.default.signHC = 'PL3';
                  break;
              case '109':
                  $scope.default.digitArr = [0, 2, 4, 6, 8];
                  $scope.default.signHC = 'PL5';
                  break;
              case '004':

                  $scope.default.signHC = '7LC';
                  break;
              case '110':
                  $scope.default.digitArr = [0, 2, 4, 6, 8, 10, 12]
                  $scope.default.signHC = '7XC';
                  break;
              case '018':
                  $scope.default.signHC = 'BJK3';
                  break;
              case '010':
                $scope.default.signHC = 'AHK3';
                break;
              case '011':
                $scope.default.signHC = 'JSK3';
                break;
              case '114':
                $scope.default.signHC = '115';
                break;
          }

          bonusIssue = bonusTrendServices.bonusIssue($scope.default.signHC, $scope);

          /**
           * 加载数据
           * @param index {String} 是不是下拉加载的凭证（不为空就下拉加载）
           * @param isRefersh {Boolean} 重新加载数据
           */
          $scope.loadMore = function (index, isRefersh){
            //$scope.issueList = bonusTrendServices.issueDataHandle($scope.default.signHC).slice(0, 20);
            bonusIssue(index, isRefersh);

          }

         $scope.$on('$ionicView.afterEnter', function(){
           $scope.isMore = true;
           $scope.loadMore(0, true);
         })




    }])
  .controller('BonusK3Ctrl', ['$scope', '$stateParams', 'bonusTrendServices',
    function($scope, $stateParams, bonusTrendServices) {


      // 默认tab显示的
      $scope.default = {
        index: 0,  // tab 显示的索引
        issueNum: [],
        remnantW: document.documentElement.clientWidth-60
      }

      $scope.isMore = true;
      $scope.isMoreGroup = true;

      // 页面的title
      $scope.bonusTitle = bonusTrendServices.getLotteryName($stateParams.id);

      switch ($stateParams.id) {
        case '018':
          $scope.default.signHC = 'BJK3';
          break;
        case '010':
          $scope.default.signHC = 'AHK3';
          break;
        case '011':
          $scope.default.signHC = 'JSK3';
          break;
      }


      $scope.$on('$ionicView.afterEnter', function(){

          bonusTrendServices.chartKSGroup($stateParams, $scope, 'group');

      })

      $scope.$on('$ionicView.leave', function(){
        // 清除缓存的期次
        bonusTrendServices.issueHandle($scope.default.signHC, '');

      })

      // 改变组合数据
      $scope.$on('changeGroupData', function(event, groupData){

        $scope.groupData = groupData;
      })

      var bonusIssue = bonusTrendServices.bonusIssue($scope.default.signHC, $scope);

      /**
       * 加载数据
       * @param index {String} 是不是下拉加载的凭证（不为空就下拉加载）
       * @param isRefersh {Boolean} 重新加载数据
       */
      $scope.loadMore = function (index, isRefersh){

        // 获取开奖的平均数据
        !$scope.sumData && bonusTrendServices.chartSum($stateParams.id).then(function(re){
          $scope.sumData = re;
        });

        bonusIssue(index, isRefersh);
      }
    }])

