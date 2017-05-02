

// 密码输入框
directiveModule.directive('passWord', function(){

    return {
        restrict: 'AE',
        transclude: true,
        replace: true,
        scope: {
            placeholder: '@',
            error: '@',
            validate: '=',
            password: '='
        },
        template: '<div class="item item-input password-input" style="position: relative; overflow: visible"><em ng-transclude is-hide ></em>' +
        '<input checkpassword ng-model="password"  type="password" placeholder={{placeholder}} required />' +
        '<i  ng-class="{iconshoweye: bBtn , iconlockeye: !bBtn}" ng-click="toggleEye()"></i><div ng-if="isShow" class="password-error" >{{error}}</div></div></div>',
        link: function(scope, ele, attrs){


            // 是否显示密码
            scope.bBtn = false;

            scope.toggleEye = function(event){

                var oInput =  ele.find('input')[0];

                if (scope.bBtn) {
                    oInput.setAttribute('type', 'password')
                } else {
                    oInput.setAttribute('type', 'text')

                }
                scope.bBtn = !scope.bBtn;

            };

            scope.$watch('validate', function(newVal, oldVal){

              if (newVal == scope.password) {
                scope.isShow = false;
              }
            })


        }
    }
}).directive('checkpassword', function(){
    var passwordRE = /^.{6,16}$/;
    return {
        link: function (scope, ele, attrs) {
            scope.isShow = false;

            // 不用错误提醒
            if (!scope.error) return;

            ele[0].onfocus =  function(){
                scope.isShow = false;
            };
            ele.bind('change', inputEvent);
            ele.bind('blue', inputEvent);

          function inputEvent(event){
            var val = ele[0].value;

            // 如果是重复密码
            if (scope.validate && scope.validate != val) {
              scope.isShow = true;
            } else if (passwordRE.test(ele[0].value)) {
              scope.isShow = false;
            } else {
              scope.isShow = true;
            }
            scope.$apply();

          }


        }

    }

}).directive('isHide', function(){
    return{
        restrict: 'AE',
        link: function(scope, ele, attrs){

            var html = ele[0].innerHTML;

            if (!html) {
                ele.remove();
            }
        }
    }
})
