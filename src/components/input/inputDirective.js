
// 密码输入框
directiveModule.directive('myInput', function(){
    return {
        restrict: 'AE',
        transclude: true,
        replace: true,
        scope: {
            value: '=',
            easyStyle: '@'
        },
        template: '<div style="-webkit-box-flex: 1; -webkit-flex: 1; flex:1; display: -webkit-box; -webkit-box-align: center">' +
        '<div ng-transclude style="box-flex: 1; -webkit-box-flex:1"></div>' +
        '<i ng-if="value" ng-class="{\'ion-close-round\': easyStyle, \'icon-clean\': !easyStyle}" ng-click="cleanHandler()"></i></div>',
        link: function(scope, ele, attrs){

            scope.cleanHandler = function(){
                scope.value = '';
            }

        }
    }
}).directive('number', function(){

    return {
        restrict: 'AE',
        require: '^ngModel',
        link: function(scope, ele, attrs, ngModelCtrl){

           var val;

           ele.bind('input', function(event){
               val = this.value;

               if (isNaN(val)) {
                   val = val.slice(0, -1);
                   this.value = val;
               }
               ngModelCtrl.$setViewValue(val);
           })


        }
    }
})
