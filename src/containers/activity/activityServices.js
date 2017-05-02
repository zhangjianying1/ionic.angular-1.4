/**
 * @date 2016-10-22
 * @auth zhang
 * @tel 15210007185
 */

// 开奖
angular.module('starter.services', []).factory('activityServices', ['globalServices', function(globalServices) {
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

    return {
        getActivity: function($scope){

            return globalServices.serialPost('3500', 'detail', {activityId: 'A014800561377970001'}).then(function(re){

                // 活动已经结束
                if (re.activity.status != 1) {
                  $scope.activityId = re.activity.activityId;

                  // 还有参加条件
                  if (re.activity.attendedTimes < re.activity.attendTimes) {
                    re.activity.activityPrizeList = $scope.signData.activityPrizeList
                    $scope.count = re.activity.attendTimes - re.activity.attendedTimes;
                  } else {
                    $scope.count = 0;
                  }
                }


                $scope.signData = re.activity;

            });
        },
        receiveSign: function(activityId) {
            return globalServices.post('3500', 'join', {activityId: activityId});
        }

    }
}])
