starter.config(['$httpProvider', function($httpProvider){

  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

  $httpProvider.defaults.transformRequest = function(data){
    var arr = [];
    for (var i in data) {
      arr.push(encodeURIComponent(i) + '=' + JSON.stringify(data[i]));
    }

    return arr.join('&');
  }

}])
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

    // 按需加载模板
    $ionicConfigProvider.templates.maxPrefetch(0);
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
            return $ocLazyLoad.load(['jsServices.js']);
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
            return $ocLazyLoad.load(['js/indexServices.js']);
          }],
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load('js/IndexController.js');
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
            return $ocLazyLoad.load('js/IndexController.js');
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
            return $ocLazyLoad.load(['js/foundServices.js', 'js/FoundController.js']);
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
              'js/entryServices.js',
              'js/LoginController.js'
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
              'js/entryServices.js',
              'js/LoginController.js',
              'js/sendCodeDirective.js'
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
              'js/entryServices.js',
              'js/LoginController.js',
              'js/sendCodeDirective.js'
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
              'js/entryServices.js',
              'js/LoginController.js',


              'js/sendCodeDirective.js'
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
            return $ocLazyLoad.load(['js/accountServices.js', 'js/UserAccountController.js']);
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
      //      return $ocLazyLoad.load(['js/accountServices.js', 'js/UserAccountController.js']);
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
            return $ocLazyLoad.load(['js/accountServices.js', 'js/UserAccountController.js']);
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
            return $ocLazyLoad.load(['js/accountServices.js', 'js/UserAccountController.js']);
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


            return $ocLazyLoad.load(['js/accountServices.js', 'js/UserAccountController.js']);
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
            return $ocLazyLoad.load(['js/accountServices.js', 'js/entryServices.js', 'js/UserAccountController.js',  ]);
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
            return $ocLazyLoad.load(['js/accountServices.js', 'js/UserAccountController.js']);
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
            return $ocLazyLoad.load(['js/entryServices.js', 'js/LoginController.js',   'js/sendCodeDirective.js']);
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
            return $ocLazyLoad.load(['js/entryServices.js', 'js/LoginController.js',   'js/sendCodeDirective.js']);
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
            return $ocLazyLoad.load(['js/accountServices.js', 'js/UserAccountController.js']);
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
            return $ocLazyLoad.load(['js/accountServices.js', 'js/UserAccountController.js']);
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
            return $ocLazyLoad.load(['js/accountServices.js', 'js/UserAccountController.js']);
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
            return $ocLazyLoad.load(['js/programmeServices.js', 'js/ProgrammeController.js']);
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
            return $ocLazyLoad.load(['js/capitalServices.js', 'js/CapitalController.js']);
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
            return $ocLazyLoad.load(['js/capitalServices.js', 'js/CapitalController.js']);
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
            return $ocLazyLoad.load(['js/capitalServices.js', 'js/CapitalController.js']);
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
            return $ocLazyLoad.load(['js/capitalServices.js', 'js/CapitalController.js']);
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
            return $ocLazyLoad.load(['js/capitalServices.js', 'js/CapitalController.js', ]);
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
            return $ocLazyLoad.load(['js/lotteryServices.js', 'js/LotteryController.js']);
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
            return $ocLazyLoad.load(['js/lotteryServices.js', 'js/LotteryController.js']);
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
            return $ocLazyLoad.load(['js/lotteryServices.js']);
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
            return $ocLazyLoad.load(['js/bonusTrendServices.js', 'js/BonusTrendController.js',  'js/bonusDirective.js']);
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
            return $ocLazyLoad.load(['js/bonusTrendServices.js', 'js/BonusTrendController.js',  'js/bonusDirective.js']);
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
            return $ocLazyLoad.load(['js/bonusTrendServices.js', 'js/BonusTrendController.js',  'js/bonusDirective.js']);
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
            return $ocLazyLoad.load(['js/bonusTrendServices.js', 'js/BonusTrendController.js',   'js/bonusDirective.js']);
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
            return $ocLazyLoad.load(['js/bonusTrendServices.js', 'js/BonusTrendController.js', 'js/bonusDirective.js']);
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
            return $ocLazyLoad.load(['js/bonustrendServices.js', 'js/BonustrendController.js',   'js/bonusDirective.js']);

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
            return $ocLazyLoad.load(['js/programmeServices.js', 'js/ProgrammeController.js']);
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
            return $ocLazyLoad.load(['js/programmeServices.js', 'js/ProgrammeController.js']);
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
            return $ocLazyLoad.load(['js/programmeServices.js', 'js/ProgrammeController.js']);
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
            return $ocLazyLoad.load(['js/capitalServices.js', 'js/CapitalController.js']);
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
            return $ocLazyLoad.load(['js/programmeServices.js', 'js/ProgrammeController.js', ]);
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

            return $ocLazyLoad.load(['js/foundServices.js', 'js/FoundController.js']);
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
            return $ocLazyLoad.load(['js/foundServices.js', 'js/FoundController.js']);
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


            return $ocLazyLoad.load(['js/foundServices.js', 'js/FoundController.js']);
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


            return $ocLazyLoad.load(['js/foundServices.js', 'js/FoundController.js', ]);
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


            return $ocLazyLoad.load(['js/foundServices.js', 'js/FoundController.js']);
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


          return $ocLazyLoad.load(['js/foundServices.js', 'js/FoundController.js']);
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
            return $ocLazyLoad.load(['js/lotteryServices.js', 'js/LotteryController.js']);
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
            return $ocLazyLoad.load(['js/lotteryServices.js', 'js/LotteryController.js']);
          }]
        }
      })
      .state('tab.foundcalculate', {
        url: '/foundcalculate/:lotteryCode',
        views: {
          'tab-found': {
            templateUrl: 'templates/calculate/calculate.html',
            controller: 'CalculateCtrl'
          }
        },
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['js/calculateServices.js', 'js/CalculateController.js']);
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
            return $ocLazyLoad.load(['js/bonusTrendServices.js']);
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
            return $ocLazyLoad.load(['js/bonusTrendServices.js', 'js/BonusTrendController.js',   'js/bonusDirective.js']);
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
            return $ocLazyLoad.load(['js/bonusTrendServices.js', 'js/BonusTrendController.js',   'js/bonusDirective.js']);

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
            return $ocLazyLoad.load(['js/bonusTrendServices.js', 'js/BonusTrendController.js',   'js/bonusDirective.js']);

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
            return $ocLazyLoad.load(['js/bonusTrendServices.js', 'js/BonusTrendController.js',   'js/bonusDirective.js']);

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
            return $ocLazyLoad.load(['js/bonusTrendServices.js', 'js/BonusTrendController.js',   'js/bonusDirective.js']);

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
            return $ocLazyLoad.load(['js/activityServices.js', 'js/ActivityController.js']);
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
            return $ocLazyLoad.load(['js/calculateServices.js', 'js/CalculateController.js']);
          }]
        }
      })

    var defaultURL = window.device && (localStorage.getItem('start') == 'false' || localStorage.getItem('start') == null)  ? '/tab/startup' : '/tab/index';

    $urlRouterProvider.otherwise(defaultURL);


  }])
