directiveModule.directive('selectPicker', function(){
  return {
    restrict: 'AE',
    replace: true,
    transclude: true,
    scope: {
      picker: '=',
      pickerVal: '='
    },
    template: '<div class="select-pick"><span class="ion-ios-arrow-back" ng-click="pickLeft()" ng-disabled="pickerVal==0"></span>' +
    '<em>{{picker[pickerVal]}}</em><span class="ion-ios-arrow-forward" ng-click="pickRight()"  ng-disabled="pickerVal==(picker.length-1)"></span></div>',
    link: function(scope, ele, attrs, toggelPanelCtrl){
      var index = scope.pickerVal;

      // 选择左边
      scope.pickLeft = function(){

        if (scope.pickerVal == 0) return;
        scope.pickerVal --;
      }

      // 选择右边
      scope.pickRight = function(){
        if (scope.pickerVal == (scope.picker.length-1)) return;
        scope.pickerVal ++;
      }
    }
  }
})
