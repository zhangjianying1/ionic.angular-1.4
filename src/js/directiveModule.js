var directiveModule = angular.module('starter.directives', [])
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
      replace: true,
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
  .directive('share', ['$ionicPopup', function($ionicPopup){
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


          var myPopup = $ionicPopup.show({
            template: '<div style="padding: 30px">是否要打开微信?</div>',
            title: '提示',
            scope: scope,
            buttons: [
              {
                text: '取消',
                onTap: function(){
                  bBtn = true;
                }
              },
              {
                text: '确定',
                type: 'c-red',
                onTap: function (e) {
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
                  }
                  e.preventDefault();
                }
              }
            ]
          });

        }
      }
    }
  }])
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


