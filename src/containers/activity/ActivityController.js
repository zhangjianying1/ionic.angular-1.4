/**
 * 活动
 * date 2016-11-13
 * auth zhang
 * tel 15210007185
 */
angular.module('starter.controllers', [])
    .controller('SignCtrl', ['$scope', 'globalServices', 'activityServices', function($scope, globalServices, activityServices) {

        var bBtn = true;

        $scope.signData = {
            activityPrizeList: [0,1,2,3,4,5]
        }
        $scope.count = -1;
        activityServices.getActivity($scope);
        $scope.againOnce = function(){
            bBtn = true;
            $scope.signData = {
                activityPrizeList: [0,1,2,3,4,5]
            }
        }
        $scope.signHandle = function(index){

            if ($scope.count == 0 || bBtn == false) return;
            bBtn = false;

            activityServices.receiveSign($scope.activityId).then(function(re){
                var tempArr = re.activity.activityPrizeList,
                    tempObj;

                angular.forEach(tempArr, function(card, i){

                    if (card.prizeValue == re.activity.prizeValue) {
                        tempObj = tempArr.splice(i, 1);
                    }
                })

                tempArr.splice(index, 0, tempObj[0]);

                $scope.signData = re.activity;
                $scope.active = index;
                $scope.count --;
            })
        }
    }])
