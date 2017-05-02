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

