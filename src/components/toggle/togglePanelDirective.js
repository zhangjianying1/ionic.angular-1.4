
/**
 * date 2016-10-19
 * auth zhang
 * tel 15210007185
 */

directiveModule.directive('togglePanel', function(){
    return {
        restrict: 'AE',
        replace: true,
        transclude: true,
        template: '<div ng-transclude></div>',
        controller: ['$scope', function($scope){
            var panels = $scope.panels = [];

            this.pushPanel = function(panel){

                panel.active = false;
                panels.push(panel);
            }

            // 点击显示
            this.showHandle = function(scope){

                if (scope.active == true) {
                    scope.active = false;
                    return;
                }
                angular.forEach(panels, function(panel){
                    panel.active = false;
                    scope.active = true;
                })
            }

        }]

    }

}).directive('panel', function(){
    return {
        restrict: 'AE',
        replace: true,
        transclude: true,
        require: '^?togglePanel',
        template: '<div ng-transclude ng-click="showHandle()" ng-class="{\'active-show\': active}"></div>',
        link: function(scope, ele, attrs, toggelPanelCtrl){
            toggelPanelCtrl.pushPanel(scope);

            scope.showHandle = function(){
                toggelPanelCtrl.showHandle(scope);
            }
        }
    }
})
