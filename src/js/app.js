var controllerModule = angular.module('starter.controllers', []);
var starter = angular.module('starter', ['ionic', 'oc.lazyLoad', 'ngCordova', 'starter.controllers', 'starter.services', 'starter.directives', 'starter.filters'])
.run(['$ionicPlatform', '$rootScope', '$ionicLoading',  '$ionicViewSwitcher', '$ionicHistory', '$location', '$ionicPopup', '$state', 'globalServices',
    function($ionicPlatform, $rootScope, $ionicLoading, $ionicViewSwitcher, $ionicHistory, $location, $ionicPopup, $state, globalServices) {

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

document.documentElement.setAttribute('data-dpr', window.devicePixelRatio);
document.documentElement.style.fontSize = document.documentElement.clientWidth / 10 * 2 + 'px';


