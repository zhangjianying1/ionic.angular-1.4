angular.module("starter.services",[]).factory("globalServices",["$http","$q","$ionicScrollDelegate","$rootScope","$timeout","$ionicLoading","$document","$ionicPlatform","$compile","$ionicModal","$ionicPopup","$cordovaFileTransfer","$state","$cordovaFile","$cordovaFileOpener2",function(t,n,e,o,i,c,a,r,s,l,u,f,d,p,h){var m=location.href.indexOf("localhost")>-1;return{post:function(){return function(e,i,c,a,r){function s(){if(!y.machId||!navigator.connection)return null;var t=navigator.connection.type,n={};return n[Connection.UNKNOWN]="Unknown connection",n[Connection.ETHERNET]="Ethernet connection",n[Connection.WIFI]="WiFi connection",n[Connection.CELL_2G]="Cell 2G connection",n[Connection.CELL_3G]="Cell 3G connection",n[Connection.CELL_4G]="Cell 4G connection",n[Connection.CELL]="Cell generic connection",n[Connection.NONE]="No network connection",n[t]}function l(t,n){"string"==typeof n&&(n={},n.code="0000"),"0008"==n.code?(h=y,u=p.localStorageHandle("account"),u?p.signIn(u,function(n){n.token?(h.token=n.token,p.post(h).then(function(n){t.resolve(n)})):d.go("tab.login")}):d.go("tab.login")):"0000"===n.code?t.resolve(n.result):(t.reject(n),!a&&p.errorPrompt(n.msg))}angular.forEach(c,function(t,n){c[n]=t+""});var u,f,p=this,h=null,g=p.localStorageHandle("registrationId"),v=n.defer(),y={cmd:e+"",func:i,machId:g||window.device&&device.uuid,token:this.userBaseMsg.token||"",msg:c||{}};return e.cmd&&(y=e),f=s(),o.isOffLine=!1,"No network connection"==f?(v.resolve({isOffLine:!0}),o.isOffLine=!0,p.errorPrompt("网络连接失败!"),v.promise):(y.machId?http.httpsPost("https://interface.icaimi.com/interface",y,function(t){t=JSON.parse(t),l(v,t)},function(t){v.reject(t),!a&&p.errorPrompt(t.msg)}):t({url:m?"/":"/h5/interface",method:m?"get":"post",data:{msg:y},headers:{"Content-Type":"application/x-www-form-urlencoded"}}).success(function(t,n){l(v,t)}).error(function(t){v.reject(t),!a&&p.errorPrompt(t.msg)}),v.promise)}}(),serialPost:function(t,e,o,i){var c=!0,a=n.defer();if(c)return c=!1,this.post(t,e,o,i).then(function(t){a.resolve(t),c=!0},function(t){a.reject(t),c=!0}),a.promise},handleHeader:function(){i(function(){e.getScrollPosition().top<0?o.$broadcast("header.hide"):o.$broadcast("header.show"),o.$digest()},100)},userBaseMsg:{},setUserBaseMsg:function(t){this.userBaseMsg=t},isEmptyObject:function(t){for(var n in t)return!1;return!0},cacheData:{},cache:function(t,n){return void 0==n?this.cacheData[t]:void(angular.isArray(this.cacheData[t])?this.cacheData[t]=this.cacheData[t].concat(n):this.cacheData[t]=n)},errorPrompt:function(t){var n='<div class="error-prompt">'+t+"</div>",e=angular.element(n);a.find("body").append(e),i(function(){e.remove()},2e3)},selectPrompt:function(t){var n=window.device?'<div class="prompt-bottom"><div class="list"><div ng-repeat="i in data" class="item" ng-click="appect(i.sign)">{{i.text}}</div></div><div class="list"><div class="item"  ng-click="cancel()">取消</div></div></div>':'<div class="prompt-bottom"><div class="list"><div class="item">上传图像<form><input type="file" name="file" onchange="appect(this)"/></form></div></div><div class="list"><div class="item"  ng-click="cancel()">取消</div></div></div>',e=angular.element(n),i=o.$new();return i.data=t.func,appect=i.appect=function(n){t.accept(n),i.cancel()},i.cancel=function(){e.remove(),t.cancel&&t.cancel()},a.find("body").append(e),s(e)(i),i.cancel},localStorageHandle:function(t,n,e){var o,i=t.key||t,c=t.page||0,a=t.pageSize||10;if(void 0!=n){e&&(o=JSON.parse(localStorage.getItem(i)),angular.isArray(o)?n=o.concat(n):this.isEmptyObject(o)||angular.extend(n,o));try{localStorage.setItem(t,JSON.stringify(n))}catch(t){}}else try{o=JSON.parse(localStorage.getItem(i)),angular.isArray(o)&&(o=o.slice(c*a,c*a+a))}catch(t){}finally{return o}},isSignIn:function(){return this.userBaseMsg.token},signIn:function(t,n,e){var o=this;t&&t.mobile&&this.post("3101","password",t,e).then(function(t){o.setUserBaseMsg(t),n&&n(t)},function(t){n&&n(t)})},autoSignin:function(t,n){this.isSignIn()?n&&n():this.signIn(t,n,!0)},updateAPP:function(){function t(t){e.post("1000","version").then(function(t){2==t.status?u.show({template:'<p class="c-333 fs-15" style="margin: 20px 5px 23px;">'+t.updateInfo+"</p>",title:"版本更新提示",buttons:[{text:"取消"},{text:"确定",type:"c-red",onTap:function(e){n(t)}}]}):3==t.status&&u.show({template:'<p class="c-333 fs-15" style="margin: 20px 5px 23px;">'+t.updateInfo+"</p>",title:"版本更新提示",buttons:[{text:"确定",type:"c-red",onTap:function(e){n(t)}}]})})}function n(t){var n,o=t.downUrl||"http://newapp.icaimi.com/apk/android-8000.apk",i={},a=cordova.file.externalRootDirectory+"/caimizhitou/com.icaimi.lottery.apk",r=!0;p.checkDir(cordova.file.externalRootDirectory,"caimizhitou").then(function(t){f.download(o,a,i,r).then(function(t){e.localStorageHandle("start",!1),h.open(a,"application/vnd.android.package-archive").then(function(){},function(t){})},function(t){c.show({template:"下载失败！",noBackdrop:!0,duration:2e3})},function(t){setTimeout(function(){n=t.loaded/t.total*100,c.show({template:"已经下载"+Math.floor(n)+"%"}),n>99&&c.hide()},100)})},function(t){p.createDir(cordova.file.externalRootDirectory,"caimizhitou",!1).then(function(t){f.download(o,a,i,r).then(function(t){e.localStorageHandle("start",!1),h.open(a,"application/vnd.android.package-archive").then(function(){},function(t){})},function(t){c.show({template:"下载失败！",noBackdrop:!0,duration:2e3})},function(t){setTimeout(function(){n=t.loaded/t.total*100,c.show({template:"已经下载"+Math.floor(n)+"%"}),n>99&&c.hide()},100)})},function(t){alert("sd卡读写错误")})})}var e=this;t()},cacheSD:function(t,e){function o(){p.writeFile(cordova.file.dataDirectory,t,e,!0).then(function(t){c.resolve(t)},function(t){c.reject(success)})}function i(t){p.readAsText(cordova.file.dataDirectory,t.name).then(function(t){c.resolve(t)},function(n){c.reject(t)})}var c=n.defer();return p.checkFile(cordova.file.dataDirectory,t).then(function(t){e?o():i(t)},function(t){o()}),c.promise},preImage:function(t){var n=null;angular.forEach(t,function(t){"use strict";n=new Image,n.src=t})},serializeLottery:function(t){var n,e=this;return angular.isArray(t)?(angular.forEach(t,function(t){n=t.lotteryCode,t.bonusNumber=e.sliceNum(t.bonusNumber);try{t.bonusTime=t.bonusTime.split(" ")[0]}catch(t){}}),t):[]},sliceNum:function(t){var n=[],e=[],o=[];if("string"!=typeof t)return e;if(t.indexOf("#")!=-1)n=t.split("#"),angular.forEach(n,function(t,n){0==n?e=t.split(","):(o=t.split(","),angular.forEach(o,function(t){e.push({blueBool:t})}))});else{if(!t||"-"==t)return"";e=t.split(",")}return e}}}]);