/**
 * 下拉刷新加载最新数据
 */


directiveModule.directive('dorpDown', function() {

    function getParent(ele, arg){
        var parent = ele.parentNode;

        return parent;
    }

    function getEleTransform(ele){

        if (!ele) return 0;

        var re = /\s([-0-9\.]*)\p/;

        var translate = ele.style.webkitTransform;

        var result =  re.exec(translate);

        return result && result[1];
    }
return {
    restrict: 'AE',
    transclude: true,
    replace: true,
    require: '^slideTabs',
    template: '<div class="dorp-down" set-height><div class="up-load"><span class="{loading: isload}"></span></div><div class="dorpcont" ><ion-scroll set-height overflow-scroll="true"><div ng-transclude ></div></ion-scroll></div>{{t}}</div>',
    link: function (scope, ele, attrs, tabCtrl) {

        scope.$on('refreshComplete', function(){

            scrollTo(0);
        })
        var options = {
            element: ele[0],
            pull: ele.find('div').eq(0).find('span')[0],
            scrollH: 80,
            scrollCritical: 68,
            speed: 300,
            deltaY: 0,
            start: 0,
            bBtn: false
        }, oScroll = null

        // 触摸屏幕开始
        options.element.addEventListener('touchstart', function (event) {

            // 获取触摸点的位置（只获取Y轴）
            options.start = event.touches && event.touches[0].pageY;
            options.startX = event.touches && event.touches[0].pageX;
            // 禁用动画
            options.element.style.webkitTransitionDuration = '0ms';

            // 当页面滚动大于0时禁用下拉加载
            scrollT = ele.find('ion-scroll')[0].scrollTop;

            if ( scrollT < 2 && (document.body.scrollTop || document.documentElement.scrollTop) < 2) {
                options.bBtn = true;
            }


        });
        // 触摸并滑动屏幕
        options.element.addEventListener('touchmove', function (event) {

            scope.t = tabCtrl.stopOtherScroll;

            if ( !tabCtrl.stopOtherScroll && options.bBtn && (document.body.scrollTop || document.documentElement.scrollTop) < 2) {
                // 获取滑动的距离
                options.deltaY = event.touches && event.touches[0].pageY - options.start;


              if (Math.abs(options.deltaY) < Math.abs(event.touches[0].pageX - options.startX)) {
                    options.bBtn = false;
                    event.preventDefault();
                    return;
                } else {
                    options.bBtn = true;
                }

                // 如果滑动向上变成负数 则不执行里面的代码
                if (options.deltaY > 0) {
                    moveTo();
                    // 阻止默认行为（会滚动屏幕，但是滚动已经在最顶端了，但还是阻止吧）
                    event.preventDefault();
                }
            }
        })
        // 触摸并离开屏幕
        options.element.addEventListener('touchend', function () {

            options.deltaY > 0 && options.bBtn && scrollOver();

        })
        /**
         * 触摸移动
         */
        function moveTo() {
            // 计算触摸距离（大于向下滑动的最高值时进行阻挠滑动）
            options.deltaY = options.deltaY > options.scrollH ? options.deltaY / (options.deltaY / window.innerHeight + 1) : options.deltaY;

            // 滑动的距离大于 可以松手刷新的时候
            if (options.deltaY > options.scrollCritical) {
                // 提示松手刷新
                options.pull.style.webkitTransform = 'rotate(0deg)';
            } else {
                options.pull.style.webkitTransform = 'rotate(180deg)';
            }

            // 滑动

            options.element.style.transform = 'translate3d(0, ' + options.deltaY + 'px , 0)';
            options.element.style.webkitTransform = 'translate3d(0, ' + options.deltaY + 'px , 0)';

        }

        /**
         * 停止滑动并松手离开
         *
         */
        function scrollOver() {

            // 滑动的距离大于可以松手加载的最大值时
            if (options.deltaY > options.scrollCritical) {
                scrollTo(68);

                setTimeout(function(){

                    scope.$apply(attrs.fn);

                }, 1000)

            } else {
                // 滚动到 0
                scrollTo(0)
            }

        }

        /**
         * 滚动到
         * @param distance {Number} 滚动到的距离
         * @param speed { Number } 动画时间
         */
        function scrollTo(distance, speed) {
            // 没传时间就用默认时间
            if (!speed) {
                speed = options.speed;
            }
            // 传入的距离
            switch (distance) {
                // 滚动到 0 时
                case 0:
                    setTimeout(function () {
                        // 可以进行下次下拉加载
                        options.bBtn = false;
                        options.pull.className = '';
                        options.deltaY = 0;
                        options.element.removeEventListener('touchmove', preventDefault, false);
                        options.element.style.transform = 'none';
                        options.element.style.webkitTransform = 'none';
                    }, 100)
                    break;
                case 68:
                    // 绑定的touchmove 里面不执行 shez options.bBtn = true;
                    options.pull.className = 'loading';
                    options.element.addEventListener('touchmove', preventDefault, false);
                    break;
                //default:
            }

            options.element.style.webkitTransitionDuration = speed + 'ms';
            options.element.style.webkitTransform = 'translate3d(0, ' + distance + 'px , 0)';
        }

        // 阻止默认行为（在加载数据的时候禁止用户滑动屏幕）
        function preventDefault(e) {
            e.preventDefault();
        }
    }
}

})


//var directiveModule = require('../../js/directiveModule.js');
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

//var directiveModule = require('../../js/directiveModule.js');
/**
 * tab
 */


directiveModule.directive('tab', function(){
    return {
        restrict: 'AE',
        transclude: true,
        replace: true,
        require: '^?tabs',
        scope: {
            title: '@',  // tab title
        },
        template: '<div ><div ng-transclude style="display:{{active ? \'block\' : \'none\'}}"></div></div>',
        link: function(scope, ele, attrs, tabCtrl){
            scope.width = document.documentElement.clientWidth;
            tabCtrl.setPanels(scope);
        }
    }
}).directive('tabs', ['$ionicScrollDelegate', function($ionicScrollDelegate){
        var winWidth = document.documentElement.clientWidth;

        return {
            restrict: 'AE',
            transclude: true,
            replace: true,
            scope: {
                index: '=',
                isHeaderBor: '@',
                isScroll: '@'
            },
            controller: ['$scope', function($scope){
                $scope.panels = [];
                $scope.childrenLen = 0;

                this.setPanels = function(scope) {

                    if ($scope.panels.length == 0) {
                        scope.active = true;
                    } else {
                        scope.active = false;
                    }
                    $scope.childrenLen += 1;
                    $scope.panels.push(scope);
                    $scope.width = ($scope.childrenLen * winWidth) + 'px';
                }



                this.index = $scope.index || 0;


            }],
            template: '<div class="slide-tabs"><div class="tab-header-wrap"><ion-scroll delegate-handle="nav" style="width:100%" direction="x"  scrollbar-x="false" style="height: 34px" ><div class="slide-tab-header" >' +
            '<div class="tab-header-box"  ng-class="{active: panel.active }" on-tap="selectHandle($event, $index, panel)" ng-repeat="panel in panels" >' +
            '<div class="tab-header-style" ng-class="{\'show-bor\': isHeaderBor}"><span>{{panel.title}}</span></div></div></div></ion-scroll></div>' +
            '<div class="slide-tab-cont"  ng-transclude ></div></div>',
            link: function(scope, ele, attrs, ctrl){
                var winW = document.documentElement.clientWidth,
                  oNav = $ionicScrollDelegate.$getByHandle('nav'),
                  oNavW,
                  oActiveBox = null;


                scope.selectHandle = function($event, $index, panel){


                    angular.forEach(scope.panels, function(panel){
                        panel.active = false;
                    })
                    panel.active = true;

                    setTimeout(function(){
                        scope.$apply(function(){
                            scope.index = $index;
                        });

                    }, 0);

                  oActiveBox = parent($event.target, 'tab-header-box');
                  oNavW = oActiveBox.offsetWidth * scope.panels.length;
                  willCenter(oActiveBox)
                }

                function parent(o, selector){
                  var result = o;

                  while (result.nodeType == 1 && !result.classList.contains(selector)) {

                    result = result.parentNode;
                  }
                  return result;
                }



                function willCenter(dom){

                  var posData = dom.getBoundingClientRect(),
                    oDomW = dom.offsetWidth,
                    offsetL = dom.offsetLeft,
                    offsetR = oNavW - offsetL + oDomW;


                  if ( offsetL < winW/2 ) {
                    oNav.scrollTo(0, 0, true)
                  } else if (offsetR < winW / 2) {
                    oNav.scrollTo(oNavW - offsetR, 0, true);
                  } else {
                    oNav.scrollTo(Math.abs(offsetL - winW/2 + oDomW/2), 0, true);
                  }
                }
            }
        }
    }]).directive('slideTab', function(){
    return {
        restrict: 'AE',
        transclude: true,
        replace: true,
        require: ['^?slideTabs'],
        scope: {
            title: '@',  // tab title

        },
        template: '<div class="slide-tab" style="width: {{width}}px" > <div ng-transclude ></div></div>',
        link: function(scope, ele, attrs, tabCtrl){
            tabCtrl = tabCtrl[0];
            scope.width = document.documentElement.clientWidth;
            tabCtrl.setPanels(scope);
        }

    }
}).directive('slideTabs', function(){
        var winWidth = document.documentElement.clientWidth;

        return {
            restrict: 'AE',
            transclude: true,
            replace: true,
            scope: {
                index: '=',
                isHeaderBor: '@'
            },
            controller: ['$scope', function($scope){
                $scope.panels = [];
                $scope.childrenLen = 0;
                this.stopOtherScroll = false;
                this.setPanels = function(scope) {

                    $scope.childrenLen += 1;
                    $scope.panels.push(scope);
                    $scope.width = ($scope.childrenLen * winWidth) + 'px';
                }

                this.index = $scope.index || 0;
            }],
            template: '<div class="slide-tabs"><div class="tab-header-wrap"><ion-scroll id="scroll-header" style="width:100%" direction="x"  scrollbar-x="false" style="height: 34px"><div class="slide-tab-header" >' +
            '<div class="tab-header-box"  ng-class="{active: $index == index}" on-tap="selectHandle($index)" ng-repeat="panel in panels" >' +
            '<div class="tab-header-style" ng-class="{\'show-bor\': isHeaderBor}"><span>{{panel.title}}</span></div></div></div></ion-scroll></div>' +
            '<div class="slide-tab-cont"  ><div class="slide-tab-one" ng-transclude style="width: {{width}}"></div></ion-scroll></div></div>',
            link: function(scope, ele, attrs, ctrl){

                var tabCont = ele[0].querySelector('.slide-tab-one'),
                    tabHeaderBox,
                    touchData = {},
                    ratio = 1,
                    index = scope.index,
                    isAnimation = true,
                    touch = null,
                    isScroll = false;

                scope.selectHandle = function($index){



                    if ($index != undefined) {

                        index = $index;
                        scope.index = $index;
                        setTimeout(function(){
                            scope.$apply();
                        }, 0)
                    }
                    tabCont.style.webkitTransitionDuration = '300ms';
                    tabCont.style.transitionDuration = '300ms';
                    tabCont.style.webkitTransform = 'translate3d(' + (-index * winWidth) + 'px, 0, 0)';
                    tabCont.style.transform = 'translate3d(' + (-index * winWidth) + 'px, 0, 0)';




                }

                function getEleTransform(ele){
                    var re = /\s([0-9\.]*)\p/;

                    var translate = ele.style.webkitTransform;

                    var result =  re.exec(translate);

                    return result && result[1];
                }


                tabCont.addEventListener('touchstart', function(event){
                    isAnimation = true;
                    touch = {
                        touchTime: new Date().getTime(),
                        touchX: event.touches[0].pageX,
                        touchY: event.touches[0].pageY,
                        touchDistance: 0,
                        countDistance: -1,

                    }
                  ctrl.stopOtherScroll = undefined;

                })

                tabCont.addEventListener('touchmove', function(event){

                    if (event.touches.length == 1) {

                        if (ctrl.stopOtherScroll === false) {
                          event.preventDefault();
                          return;
                        }
                        tabCont.style.transitionDuration = '0ms';
                        tabCont.style.webkitTransitionDuration = '0ms';
                        // 滑动的距离
                        touch.touchDistance = event.touches[0].pageX - touch.touchX;


                        // 左右滑动的距离小于上下的
                        if (Math.abs(touch.touchDistance) < Math.abs(event.touches[0].pageY -touch.touchY)) {

                          if (ctrl.stopOtherScroll == undefined) {
                            ctrl.stopOtherScroll = false;
                          }
                          isAnimation = false;

                        } else {

                          isAnimation = true;
                          if (ctrl.stopOtherScroll == undefined) {
                            ctrl.stopOtherScroll = true;
                          }

                        }

                        // 滑动到两端进行限制
                        if ((touch.touchDistance > 0  && index == 0) || (touch.touchDistance < 0 &&  index == (scope.childrenLen-1))) {
                          isAnimation = false;
                          return;
                          //ratio -= (touch.touchDistance / winWidth);
                        }

                        // 减速
                        touch.touchDistance = touch.touchDistance * ratio;
                        touch.countDistance = -index * winWidth + touch.touchDistance;

                        tabCont.style.webkitTransform = 'translateX(' + touch.countDistance + 'px)'
                        tabCont.style.transform = 'translateX(' + touch.countDistance + 'px)'
                      }



                    //event.preventDefault();
                })
                tabCont.addEventListener('touchend', function(event){
                    touch.touchTime = new Date().getTime() - touch.touchTime;

                    // 滑动时间小于250 或者 滑动的距离大于屏幕的一半
                    if (isAnimation && (touch.touchTime < 250 || Math.abs(touch.touchDistance) > winWidth/2)){

                        // 右滑动
                        if (isAnimation && touch.touchDistance < 0) {
                            index += 1;
                        }
                        // 左滑动
                        else if (isAnimation && touch.touchDistance > 0) {
                            index -= 1;
                        }
                    }
                    scope.selectHandle(index);
                    ctrl.stopOtherScroll = undefined;
                    return;
                })




            }
        }
    })


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

//
directiveModule

  // 设置高度
  .directive('setHeight', function(){
      "use strict";
      return{
          restrict: 'AE',
          link: function(scope, ele, attrs){

              ele.css('height', document.documentElement.clientHeight - ele[0].getBoundingClientRect().top - 44 + 'px')
          }
      }
  })
  // checkbox
  .directive('checkBox', function(){

    return{
      restrict: 'AE',
      replace: true,
      scope: {
        name: '@',
        value: '='
      },
      template: ' <div class="checkbox-btn" on-tap="toggleHandle()"><i class="icon icon-arc" ng-class="{\'icon-selected\': value}"></i>{{name}}</div>',
      link: function(scope, ele, attrs){

        scope.toggleHandle = function(){
          scope.value = !scope.value;
        }
      }
    }
  })
  // delete
  .directive('deleteBtn', function(){
    return{
      restrict: 'AE',

      template: '<div class="delete-btn" on-tap="toggleHandle()"><i class="icon icon-delete"></i>{{name}}</div>',
      link: function(scope, ele, attrs){
        scope.name = attrs.name;

        scope.toggleHandle = function(){

          setTimeout(function(){
            scope.$apply(attrs.deleteHandle);
          }, 0)
        }
      }
    }
  })
  // 懒加载图片
  .directive('setTimeOutLoadImg', ['$ionicScrollDelegate', function($ionicScrollDelegate){
    return{
      restrict: 'AE',
      replace: true,
      transclude: true,
      template: '<ion-content  overflow-scroll="false" has-bouncing="true" delegate-handle="oScroll" on-scroll="scrollHandle()" ><div ng-transclude=""></div> </ion-content>',
      link: function(scope, ele, attrs){

        var oScroll = $ionicScrollDelegate.$getByHandle('oScroll'),
          winH = document.documentElement.clientHeight,
          scrollData = null, oImgs,
          oImg = null, imgSrc, bBtn = true;


        // 注册 => 页面加载完成后加载图片
        scope.$on('loadImg', function(){
          loadImg();
        });
        setTimeout(loadImg, 200);
        scope.scrollHandle = function(){

          if (!bBtn) return;
          bBtn = false;
          setTimeout(function(){
            scrollData = oScroll.getScrollPosition();
            loadImg();

            // 触发上级注册的scorlling 事件
            scope.$emit('scrolling', scrollData);

            bBtn = true;
          }, 300)

        }

        function loadImg(){
          oImgs = ele.find('img');

          angular.forEach(oImgs, function(img){
            imgSrc = img.getAttribute('_src');

            if (img.getBoundingClientRect().top < winH && imgSrc) {
              oImg = new Image();

              oImg.onload = loadedImg(img, imgSrc);
              oImg.src = imgSrc;
            }
          });
        }

        function loadedImg (img, imgSrc){

          img.src = imgSrc;
          img.removeAttribute('_src');
          img.style.opacity = 1;
        }

      }
    }
  }])
  .directive('repeatFinish',function(){
    return {
      link: function(scope,element,attr){

        if(scope.$last == true){

          setTimeout(function() {
            scope.$eval(attr.repeatFinish)
          }, 1000)
        }
      }
    }
  })
/**
 * 微信分享
 */
  .directive('share',function(){
    return {
      restrict: 'AE',
      scope: {
        value: '@',
        title: '@',
        direction: '@',
        url: '@',
        thumb: '@'
      },
      transclude: true,
      template: '<div on-tap="share(value)"  ng-transclude></div>',
      link: function(scope,element,attr){
        var bBtn = true;

        scope.share = function(value){

          if (!bBtn) return;
          bBtn = false;
          if (window.Wechat){
            Wechat.share({
              message: {
                title: scope.title,
                description: scope.direction,
                thumb: 'http://h5.icaimi.com/img/calculate/win.png',
                media: {
                  type: Wechat.Type.LINK,
                  webpageUrl: scope.url
                }
              },
              scene: value
            }, function () {
              bBtn = true;

            }, function (reason) {
              bBtn = true;
            });
          } else {
            var oScript = document.createElement('script');
            oScript.src = 'http://v3.jiathis.com/code/jia.js';
            document.body.appendChild(oScript);

          }

        }
      }
    }
  })
  // 选号
  .directive('pickerBall', [function() {
    return {
      restrict: 'AE',
      replace: true,
      transclude: true,
      scope: {
        value: '='
      },
      template: '<div ng-transclude><em  on-tap="selectBall(ball.value)" ng-repeat="ball in ballNumber track by $index" ng-class="{active: ball.active}">{{ball.value}}</em></div>',
      link: function (scope, ele, attrs) {
        var len = scope.value.ballLen,
          numberArr = [];

        while (len --) {
          numberArr.push({
            active: false,
            value: repairZero(scope.value.ballLen - len)
          })
        }
        scope.ballNumber = numberArr;

        scope.selectBall = function(val){


          angular.forEach(numberArr, function(ball, index){

            if (ball.value == val) {
              ball.active = !ball.active;

              // 添加
              if (ball.active) {
                scope.value.number.push(val);
              } else{       // 删除

                scope.value.number.splice(scope.value.number.indexOf(val), 1);
              }
            }
          })

        }
        /**
         * 清空选号
         */
        scope.$on('cleanBall', function(){

          angular.forEach(numberArr, function(ball, index){
            ball.active = false;
          })
          scope.value.number = [];
        })

        function repairZero(str){
          str += '';

          if (str.length < 2) {
            return '0' + str;
          } else {
            return str;
          }
        }
      }
    }
  }])
  // 选号
  .directive('selectVal', [function() {
    return {
      restrict: 'AE',
      replace: true,
      transclude: true,
      scope: {
        value: '=',
        datas: '='   // 数据格式 {value: **, active: bollean}
      },
      template: '<div class="select"><span class="select-val" on-tap="toggleShow()">{{value}}</span><ul class="datalist"><li on-tap="selectHandle(data.value)" ng-repeat="data in datas" class="option" ng-class="{active: data.active}"><span>{{data.value}}</span></li></ul></div>',
      link: function (scope, ele, attrs) {

        var oDatalist = ele.find('ul')[0];
        scope.bBtn = false;
        getValue(scope.value);

        scope.selectHandle = function(value){
          getValue(value);
          animation();
        }

        /**
         * 获取当前的选择的数值
         * @param value
         */
        function getValue(value){
          var tempVal = value;

          angular.forEach(scope.datas, function(data){

            if (data.value == value) {
              data.active = true;
              tempVal = data.value;

            } else {
              data.active = false;
            }
          })
          scope.value = tempVal;
          scope.$emit('picker', tempVal);
        }

        scope.toggleShow = function(){

          animation();
        }

        /**
         * 显示与隐藏
         */
        function animation(){
          var iTop, sDisplay;
          oDatalist = ele.find('ul')[0];

          scope.bBtn = !scope.bBtn;
          if (scope.bBtn) {
            //sDisplay = 'block';
            iTop = 0;
            ele[0].style.overflow = 'visible';
          } else {
            iTop = -200;
            ele[0].style.overflow = 'hidden';

          }

          //oDatalist.style.display = sDisplay;

          oDatalist.style.transform = "translate3d(0," +  iTop + "%, 0)";
          oDatalist.style.webkitTransform = "translate3d(0," +  iTop + "%, 0)";

          //oDatalist.addEventListener('webkitTransitionEnd', function(){
          //  if (scope.bBtn) {
          //    oDatalist.style.display = 'none';
          //  }
          //}, false)
        }
      }
    }
  }])




angular.module('starter.controllers', []);

angular.module('starter', ['ionic', 'oc.lazyLoad', 'ngCordova', 'starter.controllers', 'starter.services', 'starter.directives', 'starter.filters'])

.run(['$ionicPlatform', '$rootScope', '$ionicLoading',  '$ionicViewSwitcher', '$ionicHistory', '$location', '$ionicPopup', '$state', 'globalServices',
    function($ionicPlatform, $rootScope, $ionicLoading, $ionicViewSwitcher, $ionicHistory, $location, $ionicPopup, $state, globalServices) {
    //var account = globalServices.localStorageHandle('account'),
    //    token = globalServices.userBaseMsg.token;

    $ionicPlatform.ready(function() {

        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            //cordova.plugins.Keyboard.disableScroll(true);
        }

        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent();
        }

        //启动极光推送服务
        if (window.plugins && window.plugins.jPushPlugin) {
            window.plugins.jPushPlugin.init();

            // 获取极光的注册用户id
            var onGetRegistradionID = function(data) {

                try {
                    globalServices.localStorageHandle('registrationId', data);

                } catch(exception) {
                    alert(exception);
                }
            }
            window.plugins.jPushPlugin.getRegistrationID(onGetRegistradionID);
            var onOpenNotification = function(event){



                var alertContent = {};
                alertContent.createTime = new Date() - 1;

                if(device.platform == "Android") {
                    alertContent.pushNoticeCode = event.extras['cn.jpush.android.MSG_ID'];
                    alertContent.content = event.alert;
                } else {
                    alertContent.pushNoticeCode = event['_j_msgid'];
                    alertContent.content = event.aps.alert;
                }

                globalServices.localStorageHandle('notices', [alertContent], true);
                return alertContent;


            }
          //var onReceiveMessage = function(event) {
          //  try {
          //    var message
          //    if(device.platform == "Android") {
          //      message = window.plus.Push.receiveMessage.message;
          //    } else {
          //      message = event.content;
          //    }
          //    alert(JSON.stringify(message))
          //  } catch(exception) {
          //    alert("JPushPlugin:onReceiveMessage-->" + exception);
          //  }
          //}
          //
          //document.addEventListener("jpush.receiveMessage", onReceiveMessage, false);
            document.addEventListener("jpush.receiveNotification", onOpenNotification, false);
            document.addEventListener("jpush.openNotification", function(event){
                var pushNoticeCode = onOpenNotification(event).pushNoticeCode;
                $state.go('tab.indexpushnoticedetail', {id: pushNoticeCode})

            }, false);


        }
    });



    $ionicPlatform.registerBackButtonAction(function (e) {

        //判断处于哪个页面时双击退出
        if ($location.path() == '/tab/index' || $location.path() == '/tab/programme' || $location.path() == '/tab/found' || $location.path() == '/tab/account') {

            $ionicPopup.show({
                template: '<p class="c-333 fs-15" style="margin: 20px 5px 23px;">您确定要退出彩米智投？</p>',
                title: '退出提示',
                buttons: [
                    {text: '取消'},
                    {
                        text: '确定',
                        type: 'c-red',
                        onTap: function (e) {
                            ionic.Platform.exitApp();
                        }
                    }
                ]
            });

        } else if ($ionicHistory.backView()) {

            $ionicHistory.goBack();
            //$ionicViewSwitcher.nextDirection("back");
        } else {
            $state.go('tab.index');
        }

        e. preventDefault();
        return false;
    }, 101);


    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){

        token = globalServices.userBaseMsg.token;
        $rootScope.chart = '';

        switch (toState.name) {
            case 'tab.startup':

                $rootScope.isHideTab = true;
                break;
            case 'tab.login':

                $rootScope.isHideTab = true;
                break;
            case 'tab.index':
                $rootScope.isHideTab = false;

                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                break;
            case 'tab.programme':

                $rootScope.isHideTab = false;
                break;
            case 'tab.found':

                $rootScope.isHideTab = false;
                break;
            case 'tab.account':
                //
                $rootScope.isHideTab = false;


                //如果用户没有登录 并且 也不是第一次登录
                if (!token) {
                    $state.go('tab.login');
                    event.preventDefault();
                }

                break;
            case 'tab.sign':

                $rootScope.isHideTab = true;
                if (!token) {
                    $state.go('tab.login', {backURL: 'tab.index'});
                    event.preventDefault();
                }

                break;
            case 'tab.programmedetail':

                $rootScope.isHideTab = true;
                if (!token) {
                    $state.go('tab.login', {backURL: 'tab.programme'});
                    event.preventDefault();
                }
                break;
            default:

              $rootScope.isHideTab = true;

        }

        // 购买后后退到方案列表
        if (fromState.name == 'tab.programmeorder' && toState.name == 'tab.programmedetail') {

          $state.go('tab.programme');
          event.preventDefault();
        }

        // 退出登录后
        if (toState.name == 'tab.usermsg') {

            if (!token) {
                $state.go('tab.index');
                event.preventDefault();
            }
        }

      // 登录或注册成功后
      if ((toState.name == 'tab.login' || toState.name == 'tab.register') && fromState.name == 'tab.account') {
          $state.go('tab.index');
          event.preventDefault();

      }


    })
}])
.config(function($httpProvider){

    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    $httpProvider.defaults.transformRequest = function(data){
        var arr = [];
        for (var i in data) {
            arr.push(encodeURIComponent(i) + '=' + JSON.stringify(data[i]));
        }

        return arr.join('&');
    }

})


.config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', '$httpProvider', '$ocLazyLoadProvider', function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider, $ocLazyLoadProvider) {
        $httpProvider.defaults.withCredentials = true;

        $ionicConfigProvider.platform.ios.tabs.style('standard');
        $ionicConfigProvider.platform.ios.tabs.position('bottom');
        $ionicConfigProvider.platform.android.tabs.style('standard');
        $ionicConfigProvider.platform.android.tabs.position('standard');

        $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
        $ionicConfigProvider.platform.android.navBar.alignTitle('center');

        $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
        $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');

        $ionicConfigProvider.platform.ios.views.transition('ios');
        $ionicConfigProvider.platform.android.views.transition('android');

        $ionicConfigProvider.backButton.text("");
        $ionicConfigProvider.backButton.previousTitleText(false);
        $ionicConfigProvider.scrolling.jsScrolling(true);
        // 禁止ios滑动后退
        $ionicConfigProvider.views.swipeBackEnabled(false);


  $stateProvider
   .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
  })
  .state('tab.startup', {
      url: '/startup',
      views: {
          'tab-index': {
              templateUrl: 'templates/index/startup.html',
              controller: 'StartUpCtrl'
          }
      },
       resolve: { // Any property in resolve should return a promise and is executed before the view is loaded

         loadMyService: ['$ocLazyLoad', function($ocLazyLoad) {
           return $ocLazyLoad.load(['js/indexServices.js']);
         }],
         loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
           // you can lazy load files for an existing module


           return $ocLazyLoad.load('js/IndexController.js');
         }]
       }
  })
  // 首页 begin
  .state('tab.index', {
      url: '/index',
      views: {
          'tab-index': {
              templateUrl: 'templates/index/index.html',
              controller: 'IndexCtrl'
          }
      },
      resolve: { // Any property in resolve should return a promise and is executed before the view is loaded

        loadMyService: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load(['js/index/indexServices.js']);
        }],
        loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {

          return $ocLazyLoad.load('js/index/IndexController.js');
        }]
      }

  })
  // 彩种定制
  .state('tab.lottercustomize', {
      url: '/lotterycustomize',
      views: {
          'tab-index': {
              templateUrl: 'templates/index/lotterycustomize.html',
              controller: 'CustomizeCtrl'
          }
      },
      resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
        loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load('js/index/IndexController.js');
        }]
      }
  })

  .state('tab.indexpushnoticedetail', {
      url: '/indexpushnoticedetail/:id',
      params: {push: 'push'},
      views: {
          'tab-index': {
              templateUrl: 'templates/found/noticedetail.html',
              controller: 'NoticeDetailCtrl'
          }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
          return $ocLazyLoad.load(['js/found/foundServices.js', 'js/found/FoundController.js']);
        }]
      }
  })

  // 首页 end
  // 首页登录相关 begin
  .state('tab.login', {
      url: '/login',
      params: {backURL: null},
      cache: false,
      views:{
          'tab-login': {
              templateUrl: 'templates/entry/login.html',
              controller: 'LoginCtrl'
          }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            'js/entry/entryServices.js',
            'js/entry/LoginController.js'
          ]);
        }]
      }
  })


  // 忘记密码
  .state('tab.forgetpassword', {
      url: '/forgetpassword',
      cache: false,
      views: {
          'tab-login': {
              templateUrl: 'templates/entry/forgetpassword.html',
              controller: 'ForgetPasswordCtrl'
          }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            'js/entry/entryServices.js',
            'js/entry/LoginCtrl.js',
            'js/entry/sendCodeDirective.js'
          ]);
        }]
      }
  })
  // 重设密码
  .state('tab.resetpassword', {
      url: '/resetpassword',
      params: {mobile: null},
      views: {
          'tab-login': {
              templateUrl: 'templates/entry/resetpassword.html',
              controller: 'ResetPasswordCtrl'
          }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            'js/entry/entryServices.js',
            'js/entry/LoginCtrl.js',
            'js/entry/sendCodeDirective.js'
          ]);
        }]
      }
  })
  // 注册
  .state('tab.register', {
      url: '/register',
      cache: false,
      views: {
          'tab-login': {
              templateUrl: 'templates/entry/register.html',
              controller: 'RegisterCtrl'
          }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            'js/entry/entryServices.js',
            'js/entry/LoginCtrl.js',


            'js/entry/sendCodeDirective.js'
          ]);
        }]
      }
  })
  // 注册协议
  .state('tab.registeragreement', {
      url: '/registeragreement',
      views: {
          'tab-login': {
              templateUrl: 'templates/entry/registeragreement.html'
          }
      }
  })
  // 登录相关 end


  // 个人中心 beigin
  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/usercenter/useraccount.html',
        controller: 'UserAccountCtrl'
      }
    },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
          // you can lazy load files for an existing module


          return $ocLazyLoad.load(['js/usercenter/accountServices.js', 'js/usercenter/UserAccountController.js']);
        }]
      }
  })
  // 设置
  //.state('tab.setting', {
  //    url: '/setting',
  //    views: {
  //        'tab-account': {
  //            templateUrl: 'templates/userfunc/setting.html',
  //            controller: 'SettingCtrl'
  //        }
  //    },
  //    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
  //      // you can lazy load files for an existing module
  //
  //
  //      return $ocLazyLoad.load(['js/usercenter/accountServices.js', 'js/usercenter/UserAccountCtrl.js']);
  //    }],
  //})



  // 个人资料
  .state('tab.usermsg', {
        url: '/usermsg',
        cache:'false',
        views: {
            'tab-account': {
                templateUrl: 'templates/usercenter/usermsg.html',
                controller: 'UserMsgCtrl'
            }
        },
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load(['js/usercenter/accountServices.js', 'js/usercenter/UserAccountController.js']);
          }]
        }
    })
  // 头像
  .state('tab.userphoto', {
      url: '/userphoto',
      views: {
          'tab-account': {
              templateUrl: 'templates/usercenter/userphoto.html',
              controller: 'UserPhotoCtrl'
          }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
          return $ocLazyLoad.load(['js/usercenter/accountServices.js', 'js/usercenter/UserAccountController.js']);
        }]
      }
  })

      // 用户名
  .state('tab.username', {
      url: '/username',
      views: {
          'tab-account': {
              templateUrl: 'templates/usercenter/username.html',
              controller: 'UserNameCtrl'
          }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
          // you can lazy load files for an existing module


          return $ocLazyLoad.load(['js/usercenter/accountServices.js', 'js/usercenter/UserAccountController.js']);
        }],
      }
  })
      // 密码管理(修改密码)
  .state('tab.modifypassword', {
      url: '/modifypassword',
      views: {
          'tab-account': {
              templateUrl: 'templates/usercenter/moditypassword.html',
              controller: 'ModityPasswordCtrl'
          }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load(['js/usercenter/accountServices.js', 'js/entry/entryServices.js', 'js/usercenter/UserAccountController.js',  ]);
        }]
      }
  })
  // 密码管理(设置密码)
  .state('tab.setpassword', {
      url: '/setpassword',
      views: {
          'tab-account': {
              templateUrl: 'templates/usercenter/setpassword.html',
              controller: 'SetPasswordCtrl'
          }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
          return $ocLazyLoad.load(['js/usercenter/accountServices.js', 'js/usercenter/UserAccountController.js']);
        }],
      }
  })
  // 忘记密码
  .state('tab.accountforgetpassword', {
      url: '/accountforgetpassword/:scopeURL',
      cache: false,
      views: {
          'tab-account': {
              templateUrl: 'templates/entry/forgetpassword.html',
              controller: 'ForgetPasswordCtrl'
          }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load(['js/entry/entryServices.js', 'js/entry/LoginController.js',   'js/entry/sendCodeDirective.js']);
        }]
      }
  })
  // 重设密码
  .state('tab.accountresetpassword', {
      url: '/accountresetpassword',
      params: {mobile: null},
      views: {
          'tab-account': {
              templateUrl: 'templates/entry/resetpassword.html',
              controller: 'ResetPasswordCtrl'
          }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load(['js/entry/entryServices.js', 'js/entry/LoginController.js',   'js/entry/sendCodeDirective.js']);
        }]
      }
  })

  // 手机号绑定
  .state('tab.usermobile', {
      url: '/usermobile',
      views: {
          'tab-account': {
              templateUrl: 'templates/usercenter/usermobile.html',
              controller: 'UserMobileCtrl'
          }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
          return $ocLazyLoad.load(['js/usercenter/accountServices.js', 'js/usercenter/UserAccountController.js']);
        }],
      }
  })
  // 联合账户
  .state('tab.userunion', {
      url: '/userunion',
      views: {
          'tab-account': {
              templateUrl: 'templates/usercenter/userunion.html',
              controller: 'UserUnionCtrl'
          }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
          return $ocLazyLoad.load(['js/usercenter/accountServices.js', 'js/usercenter/UserAccountController.js']);
        }]
      }

  })
  // 投注订单
  .state('tab.order', {
      url: '/order',
      views: {
          'tab-account': {
              templateUrl: 'templates/usercenter/order.html',
              controller: 'OrderCtrl'
          }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
          return $ocLazyLoad.load(['js/usercenter/accountServices.js', 'js/usercenter/UserAccountController.js']);
        }]
      }

  })
    // 个人订单详情
    .state('tab.orderdetail', {
        url: '/orderdetail/:orderCode',
        params: {orderCode: null},
        views: {
            'tab-account': {
                templateUrl: 'templates/programme/programmeorder.html',
                controller: 'ProgrammeOrderCtrl'
            }
        },
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load files for an existing module


            return $ocLazyLoad.load(['js/programme/programmeServices.js', 'js/programme/ProgrammeController.js']);
          }]
        }
    })
      // 使用帮助
      .state('tab.help', {
          url: '/help',
          views: {
              'tab-account': {
                  templateUrl: 'templates/userfunc/help.html',
              }
          }
      })
      // 关于我们
      .state('tab.aboutus', {
          url: '/aboutus',
          views: {
              'tab-account': {
                  templateUrl: 'templates/userfunc/aboutus.html',
              }
          }
      })
      // 个人中心 end
    // 余额
    .state('tab.balance', {
      url: '/balance',
      views: {
        'tab-account': {
          templateUrl: 'templates/capital/balance.html',
          controller: 'BalanceCtrl'
        }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load(['js/capital/capitalServices.js', 'js/capital/CapitalController.js']);
        }]
      }

    })
    // 充值
    .state('tab.recharge', {
      url: '/recharge',
      views: {
        'tab-account': {
          templateUrl: 'templates/capital/recharge.html',
          controller: 'RechargeCtrl'
        }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load(['js/capital/capitalServices.js', 'js/capital/CapitalController.js']);
        }]
      }
    })
    // 充值详情
    .state('tab.rechargedetail', {
      url: '/rechargedetail/:id',
      params: {id: null},
      views: {
        'tab-account': {
          templateUrl: 'templates/capital/rechargedetail.html',
          controller: 'RechargeDetailCtrl'
        }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load(['js/capital/capitalServices.js', 'js/capital/CapitalController.js']);
        }]
      }
    })


    // 优惠券
    .state('tab.coupon', {
      url: '/coupon',
      views: {
        'tab-account': {
          templateUrl: 'templates/capital/coupon.html',
          controller: 'CouponCtrl'
        }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load(['js/capital/capitalServices.js', 'js/capital/CapitalController.js', ]);
        }]
      }
    })
    // 优惠券
    .state('tab.indexcoupon', {
      url: '/indexcoupon',
      views: {
        'tab-index': {
          templateUrl: 'templates/capital/coupon.html',
          controller: 'CouponCtrl'
        }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load(['js/capital/capitalServices.js', 'js/capital/CapitalController.js', ]);
        }]
      }
    })
      // 开奖 begin
      .state('tab.lottery', {
          url: '/lottery',
          views: {
              'tab-index': {
                  templateUrl: 'templates/lottery/lottery.html',
                  controller: 'LotteryCtrl'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load(['js/lottery/lotteryServices.js', 'js/lottery/LotteryController.js']);
            }]
          }


      })
      // 开奖列表
      .state('tab.lotterylist', {
          url: '/lotterylist/:id',
          views: {
              'tab-index': {
                  templateUrl: 'templates/lottery/lotterylist.html',
                  controller: 'LotteryListCtrl'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load(['js/lottery/lotteryServices.js', 'js/lottery/LotteryController.js']);
            }]
          }

      })
      // 彩种走势首页
      .state('tab.bonusentry', {
          url: '/bonusentry',
          views: {
              'tab-index': {
                  templateUrl: 'templates/bonustrend/bonusentry.html'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load(['js/lottery/lotteryServices.js']);
            }]
          }
      })
      // 双色球、大乐透走势
      .state('tab.bonucycle', {
          url: '/bonuscycle/:id',
          views: {
              'tab-index': {
                  templateUrl: 'templates/bonustrend/bonuscycle.html',
                  controller: 'BonusTrendCtrl'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load(['js/bonustrend/bonusTrendServices.js', 'js/bonustrend/BonusTrendController.js',  'js/bonustrend/bonusDirective.js']);
            }]
          }
      })
      // 排列五
      .state('tab.bonusP5', {
          url: '/bonusPAILIEWU/:id',
          views: {
              'tab-index': {
                  templateUrl: 'templates/bonustrend/bonusPAILIEWU.html',
                  controller: 'BonusTrendCtrl'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load(['js/bonustrend/bonusTrendServices.js', 'js/bonustrend/BonusTrendController.js',  'js/bonustrend/bonusDirective.js']);
            }]
          }
      })

      // 排列三、3d
      .state('tab.bonus3d', {
          url: '/bonus3d/:id',
          views: {
              'tab-index': {
                  templateUrl: 'templates/bonustrend/bonus3d.html',
                  controller: 'BonusTrendCtrl'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load(['js/bonustrend/bonusTrendServices.js', 'js/bonustrend/BonusTrendController.js',  'js/bonustrend/bonusDirective.js']);
            }]
          }

      })

      // 七乐彩
      .state('tab.bonusQILECAI', {
          url: '/bonusQILECAI/:id',
          views: {
              'tab-index': {
                  templateUrl: 'templates/bonustrend/bonusQILECAI.html',
                  controller: 'BonusTrendCtrl'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load(['js/bonustrend/bonusTrendServices.js', 'js/bonustrend/BonusTrendController.js',   'js/bonustrend/bonusDirective.js']);
            }]
          }

      })
      // 快三
      .state('tab.bonusKAUISAN', {
        url: '/bonusKUAISAN/:id',
        views: {
          'tab-index': {
            templateUrl: 'templates/bonustrend/bonusKUAISAN.html',
            controller: 'BonusK3Ctrl'
          }
        },
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load files for an existing module


            return $ocLazyLoad.load(['js/bonustrend/bonustrendServices.js', 'js/bonustrend/BonustrendCtrl.js',   'js/bonustrend/bonusDirective.js']);
          }]
        }

      })
    // 快三
    .state('tab.bonus115', {
      url: '/bonus115/:id',
      views: {
        'tab-index': {
          templateUrl: 'templates/bonustrend/bonus115.html',
          controller: 'BonusTrendCtrl'
        }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load(['js/bonustrend/bonustrendServices.js', 'js/bonustrend/BonustrendCtrl.js',   'js/bonustrend/bonusDirective.js']);

        }]
      }

    })
      // 开奖 end
      // 方案 begin
      .state('tab.programme', {
          url: '/programme',
          views: {
              'tab-programme': {
                  templateUrl: 'templates/programme/programme.html',
                  controller: 'ProgrammeCtrl'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              // you can lazy load files for an existing module


              return $ocLazyLoad.load(['js/programme/programmeServices.js', 'js/programme/ProgrammeController.js']);
            }]
          }


      })
      // 方案详情
      .state('tab.programmedetail', {
          url: '/programmedetail/:programmeCode',
          params: {couponCode: null, couponAmount: null, programmeCode: null},
          views: {
              'tab-programme': {
                  templateUrl: 'templates/programme/programmedetail.html',
                  controller: 'ProgrammeDetailCtrl'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              // you can lazy load files for an existing module


              return $ocLazyLoad.load(['js/programme/programmeServices.js', 'js/programme/ProgrammeController.js']);
            }]
          }

      })
      // 方案订单详情
      .state('tab.programmeorder', {
          url: '/programmeorder/:orderCode',
          params: {orderCode: null},
          views: {
              'tab-programme': {
                  templateUrl: 'templates/programme/programmeorder.html',
                  controller: 'ProgrammeOrderCtrl'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              // you can lazy load files for an existing module


              return $ocLazyLoad.load(['js/programme/programmeServices.js', 'js/programme/ProgrammeController.js']);
            }]
          }

      })
        // 充值
        .state('tab.programmerecharge', {
            url: '/programmerecharge',
            views: {
                'tab-programme': {
                    templateUrl: 'templates/capital/recharge.html',
                    controller: 'RechargeCtrl'
                }
            },
            resolve: {
              loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                // you can lazy load files for an existing module


                return $ocLazyLoad.load(['js/capital/capitalServices.js', 'js/capital/CapitalController.js']);
              }]
            }
        })
      // 使用优惠券
      .state('tab.usecoupon', {

          url: '/usecoupon/:lotteryCode/:rewardAmount/:programmeCode',
          views: {
              'tab-programme': {
                  templateUrl: 'templates/programme/usecoupon.html',
                  controller: 'UseCouponCtrl'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              // you can lazy load files for an existing module


              return $ocLazyLoad.load(['js/programme/programmeServices.js', 'js/programme/ProgrammeController.js', ]);
            }]
          }
      })

      // 发现 begin
      .state('tab.found', {
          url: '/found',
          views: {
              'tab-found': {
                  templateUrl: 'templates/found/found.html',
                  controller: 'FoundCtrl'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {

              return $ocLazyLoad.load(['js/found/foundServices.js', 'js/found/FoundController.js']);
            }]
          }
      })
      .state('tab.consult', {
          url: '/consult',
          views: {
              'tab-found': {
                  templateUrl: 'templates/found/consult.html',
                  controller: 'ConsultCtrl'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              // you can lazy load files for an existing module


              return $ocLazyLoad.load(['js/found/foundServices.js', 'js/found/FoundController.js']);
            }]
          }
      })
      .state('tab.consultdetail', {
          url: '/consultdetail/:id',
          views: {
              'tab-found': {
                  templateUrl: 'templates/found/consultdetail.html',
                  controller: 'ConsultDetailCtrl'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              // you can lazy load files for an existing module


              return $ocLazyLoad.load(['js/found/foundServices.js', 'js/found/FoundController.js']);
            }]
          }
      })
      .state('tab.notice', {
          url: '/notice',
          views: {
              'tab-found': {
                  templateUrl: 'templates/found/notice.html',
                  controller: 'NoticeCtrl'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              // you can lazy load files for an existing module


              return $ocLazyLoad.load(['js/found/foundServices.js', 'js/found/FoundController.js', ]);
            }]
          }
      })
      .state('tab.noticedetail', {
          url: '/noticedetail/:id',
          views: {
              'tab-found': {
                  templateUrl: 'templates/found/noticedetail.html',
                  controller: 'NoticeDetailCtrl'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              // you can lazy load files for an existing module


              return $ocLazyLoad.load(['js/found/foundServices.js', 'js/found/FoundController.js']);
            }]
          }
      })
      .state('tab.pushnoticedetail', {
          url: '/pushnoticedetail/:id',
          params: {push: 'push'},
          views: {
              'tab-found': {
                  templateUrl: 'templates/found/noticedetail.html',
                  controller: 'NoticeDetailCtrl'
              }
          },
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load files for an existing module


            return $ocLazyLoad.load(['js/found/foundServices.js', 'js/found/FoundController.js']);
          }]
      })
      // 发现 中 开奖 begin
      .state('tab.foundlottery', {
          url: '/foundlottery',
          views: {
              'tab-found': {
                  templateUrl: 'templates/foundlottery/lottery.html',
                  controller: 'LotteryCtrl'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load(['js/lottery/lotteryServices.js', 'js/lottery/LotteryController.js']);
            }]
          }
      })
      // 开奖列表
      .state('tab.foundlotterylist', {
          url: '/foundlotterylist/:id',
          views: {
              'tab-found': {
                  templateUrl: 'templates/lottery/lotterylist.html',
                  controller: 'LotteryListCtrl'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              return $ocLazyLoad.load(['js/lottery/lotteryServices.js', 'js/lottery/LotteryController.js']);
            }]
          }

      })
      // 彩种走势首页
      .state('tab.foundbonusentry', {
          url: '/foundbonusentry',
          views: {
              'tab-found': {
                  templateUrl: 'templates/found/bonusentry.html'

              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              // you can lazy load files for an existing module


              return $ocLazyLoad.load(['js/bonustrend/bonustrendServices.js', 'js/bonustrend/BonustrendCtrl.js', 'js/bonustrend/bonusDirective.js', ]);
            }]
          }
      })
      // 双色球、大乐透走势
      .state('tab.foundbonucycle', {
          url: '/foundbonuscycle/:id',
          views: {
              'tab-found': {
                  templateUrl: 'templates/bonustrend/bonuscycle.html',
                  controller: 'BonusTrendCtrl'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              // you can lazy load files for an existing module


              return $ocLazyLoad.load(['js/bonustrend/bonustrendServices.js', 'js/bonustrend/BonustrendCtrl.js', 'js/bonustrend/bonusDirective.js', ]);
            }]
          }

      })
      // 排列五
      .state('tab.foundbonusP5', {
          url: '/foundbonusPAILIEWU/:id',
          views: {
              'tab-found': {
                  templateUrl: 'templates/bonustrend/bonusPAILIEWU.html',
                  controller: 'BonusTrendCtrl'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              // you can lazy load files for an existing module


              return $ocLazyLoad.load(['js/bonustrend/bonustrendServices.js', 'js/bonustrend/BonustrendCtrl.js', 'js/bonustrend/bonusDirective.js', ]);
            }]
          }

      })

      // 排列三、3d
      .state('tab.foundbonus3d', {
          url: '/foundbonus3d/:id',
          views: {
              'tab-found': {
                  templateUrl: 'templates/bonustrend/bonus3d.html',
                  controller: 'BonusTrendCtrl'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              // you can lazy load files for an existing module


              return $ocLazyLoad.load(['js/bonustrend/bonustrendServices.js', 'js/bonustrend/BonustrendCtrl.js', 'js/bonustrend/bonusDirective.js', ]);
            }]
          }

      })

      // 七乐彩
      .state('tab.foundbonusQILECAI', {
          url: '/foundbonusQILECAI/:id',
          views: {
              'tab-found': {
                  templateUrl: 'templates/bonustrend/bonusQILECAI.html',
                  controller: 'BonusTrendCtrl'
              }
          },
          resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
              // you can lazy load files for an existing module


              return $ocLazyLoad.load(['js/bonustrend/bonustrendServices.js', 'js/bonustrend/BonustrendCtrl.js', 'js/bonustrend/bonusDirective.js', ]);
            }]
          }

      })
    // 快三
    .state('tab.foundbonusKAUISAN', {
      url: '/foundbonusKUAISAN/:id',
      views: {
        'tab-found': {
          templateUrl: 'templates/bonustrend/bonusKUAISAN.html',
          controller: 'BonusK3Ctrl'
        }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
          // you can lazy load files for an existing module


          return $ocLazyLoad.load(['js/bonustrend/bonustrendServices.js', 'js/bonustrend/BonustrendCtrl.js', 'js/bonustrend/bonusDirective.js', ]);
        }]
      }

    })
      // 发现 end
        // 活动 （签到）
    .state('tab.sign', {
        url: '/sign',
        views: {
            'tab-index': {
                templateUrl: 'templates/activity/sign.html',
                controller: 'SignCtrl'
            }
        },
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['js/activity/activityServices.js', 'js/activity/ActivityController.js']);
          }]
        }
    })
    .state('tab.calculate', {
      url: '/calculate/:lotteryCode',
      views: {
        'tab-index': {
          templateUrl: 'templates/calculate/calculate.html',
          controller: 'CalculateCtrl'
        }
      },
      resolve: {
        loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load(['js/calculate/calculateServices.js', 'js/calculate/CalculateController.js']);
        }]
      }
    })


  var defaultURL = window.device && (localStorage.getItem('start') == 'false' || localStorage.getItem('start') == null)  ? '/tab/startup' : '/tab/index';

  $urlRouterProvider.otherwise(defaultURL);


}]);


document.documentElement.setAttribute('data-dpr', window.devicePixelRatio);
document.documentElement.style.fontSize = document.documentElement.clientWidth / 10 * 2 + 'px';


