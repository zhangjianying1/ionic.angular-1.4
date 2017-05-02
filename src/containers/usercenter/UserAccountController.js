/**
 * 账户中心
 * @date 2016-09-25
 * @auth zhang
 * @tel 15210007185
 */
angular.module('starter.controllers', []).controller('UserAccountCtrl', ['$scope', 'globalServices', 'accountService', function($scope, globalServices, accountService) {

    $scope.imgHeight = document.documentElement.clientWidth * 480/750;

    $scope.doRefresh = function() {

        accountService.getAccount($scope)
    };

    //// 处理下拉刷新隐藏页头
    //$scope.startScroll = function(){
    //
    //    globalServices.handleHeader();
    //
    //}
    //
    //// 显示分享层
    //$scope.showShargeLayer = function(){
    //
    //    accountService.share({
    //        shareHandle: function(msg){
    //            /**
    //             * msg 1 微信朋友
    //             *     2 微信朋友圈
    //             *     3 微博
    //             */
    //
    //        }
    //    });
    //
    //}

    $scope.$on('$ionicView.afterEnter', function(){

      accountService.getAccount($scope)
    })
}])


//个人资料
.controller('UserMsgCtrl', ['$scope', 'globalServices', '$state', '$ionicHistory', function($scope, globalServices, $state, $ionicHistory) {
   $scope.userData = globalServices.userBaseMsg;

    //退出登录
    $scope.outLogin = function(){

        // 清除缓存的账户信息
        globalServices.localStorageHandle('account', '');
        globalServices.setUserBaseMsg('');
        $ionicHistory.clearHistory();
        $state.go('tab.login')
    }

}])


// 用户名设置
.controller('UserNameCtrl', ['$scope', 'globalServices', 'accountService', function($scope, globalServices, accountService) {

    $scope.inputData = {
        mobile: globalServices.userBaseMsg.mobile,
        headImgUrl: globalServices.userBaseMsg.headImgUrl
    };

    $scope.submit = function(){
        accountService.setMemberName($scope.inputData.memberName);
    }

}])

// 个人头像
.controller('UserPhotoCtrl', ['$scope', 'globalServices', '$cordovaCamera', '$state', function($scope, globalServices,  $cordovaCamera, $state) {
    $scope.photoURL = globalServices.userBaseMsg.headImgUrl || './img/usercenter/userphoto.png',
        cancelFN = null;

        // 上传图像
    $scope.selectPhoto = function(){
        cancelFN = globalServices.selectPrompt({
            func: [
                {text: '从手机相册选择', sign: 0},
                {text: '照相', sign: 1},
            ],
            accept: function(sgin){
                selectUploadType(sgin);
            }
        });
    }
    $scope.$on('$destroy', function(){
        cancelFN && cancelFN();
    })
    try {
        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URI=0,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 100,
            targetHeight: 100,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false,
            correctOrientation:true
        };
    } catch(e){

    }
    function selectUploadType (sign) {
      var file, fr, imgData;

      // 不是app
      if (!window.device) {

        file = sign.files[0];



        if (!/image/.test(file.type)) {
          globalServices.errorPrompt('请选择正确的图像文件');
          return;
        }
        fr = new FileReader();

        fr.onload = function(e) {
          $scope.photoURL = e.target.result;
          imgData = $scope.photoURL.substring($scope.photoURL.indexOf('base64,') + 7);
          updateImg(imgData);
        };

        fr.readAsDataURL(file);
        return;
      };

      // 默认是图库
      var type = 'PHOTOLIBRARY';


      // 拍照
      if (sign == 1) {
        type = 'CAMERA';
      }

      try {
        options.sourceType = Camera.PictureSourceType[type];


        $cordovaCamera.getPicture(options).then(function (imageData) {
          $scope.photoURL = 'data:image/jpeg;base64,' + imageData;
          updateImg(imageData);

        })

      } catch(e){

      }
    }
    function updateImg(imageData){

      globalServices.post('3103', 'headImg', {headImgUrl: imageData}).then(function(re){

        if (re.fileUrl) {
          globalServices.userBaseMsg.headImgUrl = re.fileUrl;
          globalServices.setUserBaseMsg(globalServices.userBaseMsg);
        }
        $state.go('tab.usermsg');
      })
    }

}])

// 修改密码
.controller('ModityPasswordCtrl', ['$scope', 'accountService', function($scope, accountService) {
    $scope.inputData = {};
    $scope.formSub = function(){
        accountService.modifyPassword($scope.inputData);
    }
}])

// 设置密码
.controller('SetPasswordCtrl', ['$scope', 'accountService', function($scope, accountService) {
    $scope.inputData = {};
    $scope.formSub = function(){
        accountService.setPassword($scope.inputData);
    }
}])

// 绑定手机号
.controller('UserMobileCtrl', ['$scope', 'globalServices',  'accountService', function($scope, globalServices, accountService) {

        $scope.inputData = {};

        $scope.formSub = function(){
            accountService.bindMobile($scope.inputData.mobile)
        }

}])


// 联合账户
.controller('UserUnionCtrl', ['$scope', 'globalServices', '$ionicPopup', '$state', function($scope, globalServices, $ionicPopup, $state) {

        //var pop = $ionicPopup.show({
        //    template: '<div style="margin: 15px 0 5px"><pass-word style="margin-bottom: 3px;" password="password" placeholder="请输入密码"></pass-word><p class="c-red fs-13">密码错误，请重新输入</p></div>',
        //    title: '请输入密码',
        //    scope: $scope,
        //    buttons: [
        //        { text: '取消' },
        //        {
        //            text: '<b>确定</b>',
        //            type: 'c-red',
        //            onTap: function(e) {
        //
        //                setTimeout(function(){
        //                    pop.close();
        //                }, 1000)
        //                e.preventDefault();
        //            }
        //        },
        //    ]
        //});

        //$ionicPopup.show({
        //    template: '<div><p class="c-333 fs-16" style="margin: 20px 5px 3px;">您确定要解除微信账户与当前账户的绑定?。</p><p class="fs-13" style="margin: 0 5px 23px;">解除绑定后，您仅可通过当前账户绑定的手机号或用户名登录</p></div>',
        //    title: '解除联合绑定',
        //    scope: $scope,
        //    buttons: [
        //        { text: '取消' },
        //        {
        //            text: '<b>确定</b>',
        //            type: 'c-red',
        //            onTap: function(e) {
        //               alert(3)
        //            }
        //        },
        //    ]
        //});

        $scope.bindAccount = function(msg) {

            var pop = $ionicPopup.show({
                template: '<p class="c-333 fs-15" style="margin: 30px 5px 33px;">您尚未设置登陆密码，解绑联合账户后可能造成账户无法登陆。</p>',
                title: '解除联合绑定',
                scope: $scope,
                buttons: [
                    {text: '取消'},
                    {
                        text: '<b>马上设置</b>',
                        type: 'c-red',
                        onTap: function (e) {

                            // 通知设置密码页,设置密码成功后返回的页面
                            $state.go('tab.accountsetpassword');
                        }
                    },
                ]
            });
        }
}])
// 我的订单
    .controller('OrderCtrl', ['$scope', 'globalServices', 'accountService', '$state', function($scope, globalServices, accountService, $state) {

        $scope.orders = [];
        $scope.isMore = true;

        var getOrderList = accountService.orderList($scope);

        $scope.loadMore = function() {
            getOrderList();
        }
        $scope.doRefresh = function(){
            getOrderList(1);
        }
    }])

