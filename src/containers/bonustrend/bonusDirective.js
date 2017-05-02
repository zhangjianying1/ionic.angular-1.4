//var directiveModule = require('../../js/directiveModule.js');

/**
 * data 2016-10-26
 * auth zhang
 * tel 15210007185
 *
 */
angular.module('starter.directives', []).directive('bonusFull', ['bonusTrendServices', '$rootScope', function(bonusTrendServices, $rootScope) {


    return {
        restrict: 'AE',
        transclude: true,
        replace: true,
        scope: {
            signCache: '=',
            sign: '@',
            issueList: '='
        },
        template: '<div><div class="column-body">' +
                '<div style="width:60px"><section></section></div>'+
                '<div class="column-left-other cont"><section class="column-scroll-x" chart-client-width></section></div>'+
                '</div></div>',
        link: function(scope, ele, attrs){
            var winH, winW,ifr1win,
                scrollL,scrollDom;


            ifr1win = ele.find('section')[1];
            winH = document.documentElement.clientHeight;
            winW = document.documentElement.clientWidth;

            ifr1win.onscroll = function(event){
                scrollDom = ele[0].parentNode.querySelector('section');
                scrollL = event.target.scrollLeft;

                if (scrollDom) {

                    scrollDom.style.webkitTransform = 'translate3d('+ -scrollL + 'px, 0, 0)';
                    scrollDom.style.transform = 'translate3d(' + -scrollL + 'px, 0, 0)';
                }


            }

          var oSection1 = ele.find('section')[0];
          var oSection2 = ele.find('section')[1];


          var i = 0;
          scope.$watch('sign', function(newVal, oldVal){

            i += 1;

            if (i > 1) {
              if (newVal.indexOf('def') > -1){

                showChart(scope.signCache);
              }
            }

          })
          scope.$watch('issueList', function(newVal, oldVal){

            if (newVal) {
              showChart();
            }
          })

          function showChart(sign){
            var oc1, oc2,
              data = scope.issueList;
            if (!data.length) return;
            if (!sign) {
              oc1 = drawChartIssue(data);
              oSection1.appendChild(oc1);
            } else {
              oSection2.innerHTML = '';
              data = bonusTrendServices.issueData[sign];
            }


            oc2 = drawChart(data, scope.sign);
            oSection2.appendChild(oc2);
          }
          /**
           *
           * @param oCanvas
           * @param datas
           */
            function drawChartIssue(datas){
              var cellW = 120, cellH = 68,
                ocW = cellW,
                ocH = cellH * datas.length;

              var oCanvas = document.createElement('canvas');
              oCanvas.width = ocW;
              oCanvas.height = ocH;



            if (oCanvas.getContext) {
                var oc = oCanvas.getContext('2d');

                datas.forEach(function(data, index){

                    drawNum(oc, cellW, cellH, index, data.issue);

                })
              oCanvas.style.width = ocW /2 + 'px';
              oCanvas.style.height = ocH / 2+ 'px';
              return oCanvas;
            }

              function drawNum(oc, width, height, rowIndex, num) {



                if (rowIndex % 2) {
                  oc.beginPath();
                  oc.fillStyle = '#f4f4f4';
                  oc.fillRect(0, rowIndex * cellH, cellW, cellH);
                  oc.closePath()
                }

                oc.beginPath();
                oc.lineWidth = 1;
                oc.strokeStyle = '#ddd';

                oc.moveTo(0, rowIndex*height + height);
                oc.lineTo(width, rowIndex*height + height);

                oc.lineTo(width, rowIndex*height);
                oc.stroke();

                oc.beginPath();
                oc.font = "24px Arial";
                oc.fillStyle = '#666';
                oc.textAlign = 'center';
                oc.textBaseline = 'middle';
                oc.fillText(num,  width / 2, rowIndex * height + height / 2);
              }

            }

          /**
           *
           * @param oCanvas
           * @param datas
           * @param sign
           */
            function drawChart(datas, sign){

              var cellW = 60, cellH = 68,
                contW = document.documentElement.clientWidth - 60,
                cellLen = datas[0].yiLou[sign].length;

              if (contW > cellLen * 30) {
                cellW = contW / cellLen * 2;
              }

            var oCanvas = document.createElement('canvas');
              var ocH = datas.length * cellH;
              var ocW = cellLen * cellW,
                  arcStyle = (sign == 'blue' ? '#167CE8' : '#ff3939');
              oCanvas.width = ocW ;
              oCanvas.height = ocH ;


              if (oCanvas.getContext) {
                var oc = oCanvas.getContext('2d');

                datas.forEach(function(data, index){
                  data.yiLou[sign].forEach(function(nums, i){
                    drawNum(oc, cellW, cellH, index, i, nums, arcStyle);
                  })
                })
                oCanvas.style.width = ocW /2 + 'px';
                oCanvas.style.height = ocH / 2+ 'px';
                return oCanvas;
              }

              function drawNum(oc, width, height,  rowIndex, cellIndex, num, arcStyle) {


                if (rowIndex % 2) {
                  oc.beginPath();
                  oc.fillStyle = '#f4f4f4';
                  oc.fillRect(cellIndex * cellW, rowIndex * cellH, cellW, cellH);
                  oc.closePath()
                }

                if (num == 0) {

                  if (sign == 'red' || sign == 'blue') {
                    num = cellIndex + 1;
                  } else {
                    num = cellIndex;
                  }

                  oc.beginPath();
                  oc.fillStyle = arcStyle;
                  oc.arc(cellIndex * width + width / 2, rowIndex * height + height / 2, height / 2 - 10, 0, Math.PI * 2);
                  oc.fill();
                  oc.fillStyle = '#fff';
                } else {
                  oc.fillStyle = '#666';
                }


                oc.beginPath();
                oc.lineWidth = 1;
                oc.strokeStyle = '#ddd';

                oc.moveTo(cellIndex * width, rowIndex*height);
                oc.lineTo(cellIndex * width, rowIndex*height + height);

                oc.lineTo(cellIndex * width + width, rowIndex*height + height);
                oc.stroke();

                oc.beginPath();
                oc.font = "24px Arial";

                oc.textAlign = 'center';
                oc.textBaseline = 'middle'
                oc.fillText(num, cellIndex * width + width / 2, rowIndex * height + height / 2);


              }
            }
        }
    }
}])


  //查看更多
.directive('showMore', ['bonusTrendServices', '$stateParams', function(bonusTrendServices, $stateParams) {

    return {
        restrict: 'AE',
        transclude: true,
        replace: true,
        scope: {
            pickerVal: '=',
            signArr: '=',
            index: '=',
            isFull: '='
        },
        templateUrl:'miss.html',
        link: function(scope, ele, attrs){

            var once = true,
                chartSum,
                signSup;

            scope.bBtn = false;
            scope.promptTitle = '查看历史统计';
            scope.totalSum = [];
            scope.avgYiLou = [];
            scope.maxYilou = [];
            scope.maxLianChu= [];
            scope.winW = document.documentElement.clientWidth;


            function setData(chartSum){
                // 是数组
                if (angular.isArray(scope.signArr[scope.index])){

                    signSup = scope.signArr[scope.index][scope.pickerVal];

                } else {
                    signSup = scope.signArr[scope.index];
                }

                scope.totalSum = chartSum.totalSum[signSup] || chartSum.totalSum.def && chartSum.totalSum.def.slice(scope.index*10, scope.signArr[scope.index] + scope.index*10);
                scope.avgYiLou = chartSum.avgYiLou[signSup] || chartSum.totalSum.def && chartSum.avgYiLou.def.slice(scope.index*10, scope.signArr[scope.index] + scope.index*10);
                scope.maxYiLou = chartSum.maxYiLou[signSup] || chartSum.totalSum.def && chartSum.maxYiLou.def.slice(scope.index*10, scope.signArr[scope.index] + scope.index*10);
                scope.maxLianChu = chartSum.maxLianChu[signSup] || chartSum.totalSum.def && chartSum.maxLianChu.def.slice(scope.index*10, scope.signArr[scope.index] + scope.index*10);

            }

            scope.showSum = function(){

                scope.bBtn = !scope.bBtn;

                if (scope.bBtn) {
                    ele.css('height', '180px');
                    scope.promptTitle = '收起历史统计';
                    if (once) {
                        once = false;
                        setTimeout(function(){
                          // 获取开奖的平均数据
                          bonusTrendServices.chartSum($stateParams.id).then(function (re) {
                            chartSum = re;
                            setData(chartSum);
                          })
                        }, 100)

                    } else {
                        setData(chartSum);
                    }




                } else {
                    ele.css('height', '44px');
                    scope.promptTitle = '查看历史统计';
                }





            }

            scope.$on('hideMore', function(){
                ele.css('height', '44px');
                scope.promptTitle = '查看历史数据';
                scope.bBtn = false;
            })
        }
    }
}])  // 设置图表高度
.directive('chartHeight', function(){

    return{
        restrict: 'AE',
        link: function(scope, ele, attrs){
            winW = document.documentElement.clientWidth;

            ele.css({'height': document.documentElement.clientHeight - 160 + 'px'})
        }
    }
})
  .directive('chartClientWidth', function(){

      return{
          restrict: 'AE',
          link: function(scope, ele, attrs){
              winW = document.documentElement.clientWidth;

              ele.css({'width': (winW - 60) + 'px'})
          }
      }
  })
  .directive('issue', function(){
    return {
      restrict: 'AE',
      replace: true,
      scope: {
        issueData: '='
      },
      template: '<div class="bonus-row"><div class="bonus-col bg-fdd9d9" ng-repeat="number in issueData track by $index" style="width:{{width}}px"><span >{{number}}</span></div></div>',
      link: function(scope, ele, attrs){
        var contW = document.documentElement.clientWidth - 60,
            len =  scope.issueData.length;

        scope.width = 30;


        if (contW > scope.width * len) {
          scope.width = contW / len;
        }
      }

    }})
  .directive('showGroup', ['bonusTrendServices', function(bonusTrendServices){
    return{
      restrict: 'AE',
      scope: {
        sign: '@'
      },
      template: '<div class="group-more" ><h3 class="group-header" on-tap="showLayer()">{{playName}}<i class="icon icon-down-more" ng-class="{\'direction-up\': isUp}"></i></h3>' +
        '<div class="group-title-list"><div><em  on-tap="selectHandle()" ng-class="{active: playName == \'组合\'}">全部组合</em></div>' +
        '<div ng-repeat="groups in cacheData track by groups.playName"><em  on-tap="selectHandle(groups.playName)" ng-class="{active: \'\' + groups.playName == playName}">{{groups.playName}}</em></div></div></div>',
      link: function(scope, ele, attrs){
        var oList = ele.find('div')[0].querySelector('.group-title-list'),
            groupData = [];

        scope.cacheData = bonusTrendServices.issueDataHandle(scope.sign);

        scope.playName = '组合';
        scope.selectHandle = function(arg){

          if (!arg) {
            groupData = scope.cacheData;
            scope.playName = '组合';

          } else {
            angular.forEach(scope.cacheData, function(data, index){

              if (data.playName == arg) {
                scope.playName = arg;
                groupData = scope.cacheData.slice(index, index+1);
              }
            })
          }
          translateToY(0);

          document.body.scrollTop = document.documentElement.scrollTop = 0;
          scope.$emit('changeGroupData', groupData);
          scope.isUp = false;
        }
        scope.showLayer = function(){
          var y;

          if (scope.isUp) {
            y = 0;
          } else {
            y = -oList.offsetHeight;
          }

          translateToY(y);
          scope.isUp = !scope.isUp;
        }

        function translateToY(y){

          oList.style.transform = 'translate3d(0, ' + y + 'px, 0)';
          oList.style.webkitTransform = 'translate3d(0, ' + y + 'px, 0)';
        }
      }
    }
  }])
  .directive('bonusK3', ['bonusTrendServices', '$rootScope', function(bonusTrendServices, $rootScope) {


    return {
      restrict: 'AE',
      transclude: true,
      replace: true,
      scope: {
        sign: '@',
        issueList: '=',
        sumData: '='
      },
      template: '<section></section>',
      link: function(scope, ele, attrs){
        scope.isOffLine = $rootScope.isOffLine;
        scope.winW = document.documentElement.clientWidth;

        var oSection = ele[0],
            index = 0;




        scope.$watch('issueList', function(newVal, oldVal){
          index += 1;

          if (newVal) showChart(scope.sign, index < 2);
        })
        function showChart(sign, isAdd){
          var oc,
            data = getConcatData(sign, isAdd);

          oc = drawChart(data, sign, isAdd);
          oSection.appendChild(oc);
        }

        /**
         * 重新组合数据
          * @param newVal
         */
        function getConcatData(sign, isAdd){

          var sumData = angular.copy(scope.sumData),
              result = [];
          angular.copy(scope.issueList, result);

          if (isAdd) {

            // 和值 4-10
            if (sign.indexOf('sum4') > -1) {
              angular.forEach(result, function(val){
                if (val.yiLou.sum) {
                  val.yiLou.def = val.yiLou.sum.slice(0, 7);
                }
              })
              sign = 'sum';
              shiftData(0, 7);
            } else if (sign.indexOf('sum11') > -1) {
              angular.forEach(result, function(val){
                if (val.yiLou.sum) {
                  val.yiLou.def = val.yiLou.sum.slice(7, 15);
                }
              })
              sign = 'sum';
              shiftData(7, 7);
            } else if (sign.indexOf('span') > -1) {
              angular.forEach(result, function(val){
                if (val.yiLou.span) {
                  val.yiLou.def = val.yiLou.span
                }
              })
              shiftData();
            } else {
              shiftData();
            }

          }
          angular.forEach(result, function(val, index){
            var newArr = val.yiLou.def;
            newArr.unshift(val.issue.substring(4));

            if (index == 0 && isAdd) {

              newArr.splice(1, 0, '最大遗漏');

            } else if (index == 1 && isAdd){
              newArr.splice(1, 0, '平均遗漏')

            } else {
              newArr.splice(1, 0, val.bonusNumber.split(',').join(' '))

            }
          })


          return result;

          function shiftData(index, len){
            if (angular.isArray(result)) {

              // 添加最大遗漏
              result.unshift({
                issue: '',
                yiLou: {
                  def: sign == 'sum' ? sumData.avgYiLou[sign].slice(index, index + len) : sumData.avgYiLou[sign]
                }
              });

              // 添加平均遗漏
              result.unshift({
                issue: '',
                yiLou: {
                  def: sign == 'sum' ? sumData.maxYiLou[sign].slice(index, index + len) : sumData.maxYiLou[sign]
                }
              });
            }
          }
        }


        /**
         *
         * @param oCanvas
         * @param datas
         * @param sign
         * @param isAdd 是否添加其他样式
         */
        function drawChart(datas, sign, isAdd){
          var cellW = 60, cellH = 68,
            winW = document.documentElement.clientWidth,
            cellLen = datas[0].yiLou.def.length;


          if (cellLen <= 10) {
            cellW = ((winW - 120) / (cellLen - 2)) * 2;

          }

          var ocH = datas.length * cellH;
            arcStyle = '#ff3939',
              oCanvas = document.createElement('canvas');
          oCanvas.width = winW * 2;
          oCanvas.height = ocH;

          if (oCanvas.getContext) {
            datas.forEach(function(data, index){
              data.yiLou.def.forEach(function(nums, i){
                drawNum(oCanvas, cellW, cellH, index, i, nums, arcStyle);
              })
            })
            return oCanvas;
          }

          function drawNum(oCanvas, width, height,  rowIndex, cellIndex, num, arcStyle) {
            var oc = oCanvas.getContext('2d'),
              bg;


            if (rowIndex == 0 && isAdd) {
              bg = '#FCF2CE';

            } else if (rowIndex == 1 && isAdd) {
              bg = '#DFEFFF';
            } else {
              if (rowIndex % 2) {
                bg = '#f4f4f4';
              } else {
                bg = '#fff';
              }
            }
            drawRect(oc, width, bg);

            if (cellIndex == 1 || cellIndex == 0) {

              drawLine(oc, rowIndex, cellIndex, 120, height);
              if ((cellIndex == 1 && rowIndex > 1) || (!isAdd && cellIndex ==1) ) {
                drawFont(oc, width, num, sign, {color: '#ff3939'});
              } else {
                drawFont(oc, width,  num, sign);
              }

            } else {
              drawLine(oc, rowIndex, cellIndex, width, height);
              drawFont(oc, width, num, sign);

            }

            oCanvas.style.width = winW  + 'px';
            oCanvas.style.height = ocH / 2 + 'px';

            function drawRect(oc, width, style){
              if (cellIndex == 0 || cellIndex == 1) {
                width = 120;

              }

              oc.beginPath();
              oc.fillStyle = style;

              if (cellIndex > 1) {
                oc.fillRect(cellIndex * width + (120 -width) * 2 , rowIndex * cellH, width, cellH);
              } else {
                oc.fillRect(cellIndex * width, rowIndex * cellH, width, cellH);
              }
            }
            function drawArc(){
              if (num === 0) {

                oc.beginPath();
                oc.fillStyle = arcStyle;

                if (cellIndex == 0) {
                  oc.arc(cellIndex * width + width / 2, rowIndex * height + height / 2, height / 2 - 10, 0, Math.PI * 2);

                } else if (cellIndex == 1) {
                  oc.arc(cellIndex * width + width / 2 + (120 -width), rowIndex * height + height / 2, height / 2 - 10, 0, Math.PI * 2);

                } else {
                  oc.arc(cellIndex * width + width / 2 + (120 -width) * 2, rowIndex * height + height / 2, height / 2 - 10, 0, Math.PI * 2);

                }
                oc.fill();

              }
            }
            function drawLine(oc, rowIndex, cellIndex, width, height){


              oc.beginPath();
              oc.lineWidth = 1;
              oc.strokeStyle = '#ddd';
              if (cellIndex == 0){
                oc.moveTo(cellIndex * width, rowIndex*height);
                oc.lineTo(cellIndex * width, rowIndex*height + height);
                oc.lineTo(cellIndex * width + width, rowIndex*height + height);

              } else if (cellIndex == 1){
                oc.moveTo(cellIndex * width + (120 -width), rowIndex*height);
                oc.lineTo(cellIndex * width + (120 -width), rowIndex*height + height);
                oc.lineTo(cellIndex * width + width + (120 -width), rowIndex*height + height);
              } else {
                oc.moveTo(cellIndex * width + (120 -width) * 2, rowIndex*height);
                oc.lineTo(cellIndex * width + (120 -width) * 2, rowIndex*height + height);
                oc.lineTo(cellIndex * width + width + (120 -width) * 2, rowIndex*height + height);
              }

              oc.stroke();
            }

            /*
             * @param oc
             * @param width
             * @param num
             * @param style
             * @param sign {写字的规则}
             */
            function drawFont(oc, width, num, sign, style){
              drawArc();
              var baseStyle = {};

              if (style) {
                baseStyle = style;
              } else if (num == 0) {
                baseStyle.color = '#fff';
              } else {
                baseStyle.color = '#666';
              }
              oc.beginPath();
              if (num === 0) {
                oc.fillStyle = baseStyle.color;
                num = cellIndex + ((sign == 'span') ? -2 : (sign == 'sum4') ? 2 : (sign == 'sum11') ? 9 : -1);
              } else {
                oc.fillStyle = baseStyle.color;
              }
              oc.font = "24px Arial";

              oc.textAlign = 'center';
              oc.textBaseline = 'middle';

              if (cellIndex == 0) {
                oc.fillText(num, 60, rowIndex * height + height / 2);

              } else if (cellIndex == 1) {
                oc.fillText(num, 180, rowIndex * height + height / 2);

              } else {
                oc.fillText(num, cellIndex * width + width / 2 + (120 - width) * 2, rowIndex * height + height / 2);

              }
            }
          }
        }
      }
    }
  }])
  .directive('scrollLoad', ['bonusTrendServices', '$rootScope', function(bonusTrendServices, $rootScope) {


    return {
      restrict: 'AE',
      transclude: true,
      replace: true,
      template: '<div style="width: 100%"><div class="off-line" ng-if="isOffLine">网络连接失败,请检查网络!</div>' +
      '<div class="loading-wrap" ng-if="!isOffLine"><span class="loading" style="-webkit-transform: rotate(0deg);"></span></div></div>',
      link: function (scope, ele, attrs) {
        var loading = null,
          bBtn = true,
          scrollT = 0,
          winH = document.documentElement.clientHeight,
          distance = attrs.distance || 40;

        if (!attrs.onInfinite) return;

        setTimeout(function(){
          window.onscroll = loadingData;
        }, 1000)

        function loadingData(){
          scrollT = document.body.scrollTop || document.documentElement.scrollTop;

          loading = ele[0].querySelector('.loading-wrap');

          if (bBtn) {
            bBtn = false;

            setTimeout(function(){

              if (loading && winH - loading.getBoundingClientRect().top > distance ) {
                scope.$apply(attrs.onInfinite);
              }
              bBtn = true;
            }, 100)
          }

        }
        if (attrs.isScrollLoad == 'false') {
          setTimeout(function(){
            loadingData();
          }, 100)
        }

      }
    }
  }])

