angular.module("starter.controllers",[]).controller("UserAccountCtrl",["$scope","globalServices","accountService",function(e,t,o){e.imgHeight=480*document.documentElement.clientWidth/750,e.doRefresh=function(){o.getAccount(e)},e.$on("$ionicView.afterEnter",function(){o.getAccount(e)})}]).controller("UserMsgCtrl",["$scope","globalServices","$state","$ionicHistory",function(e,t,o,n){e.userData=t.userBaseMsg,e.outLogin=function(){t.localStorageHandle("account",""),t.setUserBaseMsg(""),n.clearHistory(),o.go("tab.login")}}]).controller("UserNameCtrl",["$scope","globalServices","accountService",function(e,t,o){e.inputData={mobile:t.userBaseMsg.mobile,headImgUrl:t.userBaseMsg.headImgUrl},e.submit=function(){o.setMemberName(e.inputData.memberName)}}]).controller("UserPhotoCtrl",["$scope","globalServices","$cordovaCamera","$state",function(e,t,o,n){function r(n){var r,i,s;if(!window.device)return r=n.files[0],/image/.test(r.type)?(i=new FileReader,i.onload=function(t){e.photoURL=t.target.result,s=e.photoURL.substring(e.photoURL.indexOf("base64,")+7),c(s)},void i.readAsDataURL(r)):void t.errorPrompt("请选择正确的图像文件");var l="PHOTOLIBRARY";1==n&&(l="CAMERA");try{a.sourceType=Camera.PictureSourceType[l],o.getPicture(a).then(function(t){e.photoURL="data:image/jpeg;base64,"+t,c(t)})}catch(e){}}function c(e){t.post("3103","headImg",{headImgUrl:e}).then(function(e){e.fileUrl&&(t.userBaseMsg.headImgUrl=e.fileUrl,t.setUserBaseMsg(t.userBaseMsg)),n.go("tab.usermsg")})}e.photoURL=t.userBaseMsg.headImgUrl||"./img/usercenter/userphoto.png",cancelFN=null,e.selectPhoto=function(){cancelFN=t.selectPrompt({func:[{text:"从手机相册选择",sign:0},{text:"照相",sign:1}],accept:function(e){r(e)}})},e.$on("$destroy",function(){cancelFN&&cancelFN()});try{var a={quality:50,destinationType:Camera.DestinationType.DATA_URI=0,allowEdit:!0,encodingType:Camera.EncodingType.JPEG,targetWidth:100,targetHeight:100,popoverOptions:CameraPopoverOptions,saveToPhotoAlbum:!1,correctOrientation:!0}}catch(e){}}]).controller("ModityPasswordCtrl",["$scope","accountService",function(e,t){e.inputData={},e.formSub=function(){t.modifyPassword(e.inputData)}}]).controller("SetPasswordCtrl",["$scope","accountService",function(e,t){e.inputData={},e.formSub=function(){t.setPassword(e.inputData)}}]).controller("UserMobileCtrl",["$scope","globalServices","accountService",function(e,t,o){e.inputData={},e.formSub=function(){o.bindMobile(e.inputData.mobile)}}]).controller("UserUnionCtrl",["$scope","globalServices","$ionicPopup","$state",function(e,t,o,n){e.bindAccount=function(t){o.show({template:'<p class="c-333 fs-15" style="margin: 30px 5px 33px;">您尚未设置登陆密码，解绑联合账户后可能造成账户无法登陆。</p>',title:"解除联合绑定",scope:e,buttons:[{text:"取消"},{text:"<b>马上设置</b>",type:"c-red",onTap:function(e){n.go("tab.accountsetpassword")}}]})}}]).controller("OrderCtrl",["$scope","globalServices","accountService","$state",function(e,t,o,n){e.orders=[],e.isMore=!0;var r=o.orderList(e);e.loadMore=function(){r()},e.doRefresh=function(){r(1)}}]);