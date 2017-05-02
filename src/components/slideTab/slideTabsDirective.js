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
