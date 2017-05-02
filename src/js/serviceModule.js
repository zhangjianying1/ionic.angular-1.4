/**
 * @date 2016-09-29
 * @auth zhang
 * @tel 15210007185
 */



//服务主模块
angular.module('starter.services', [])
    .factory('globalServices', ['$http', '$q', '$ionicScrollDelegate', '$rootScope', '$timeout',
        '$ionicLoading', '$document', '$ionicPlatform', '$compile', '$ionicModal', '$ionicPopup', '$cordovaFileTransfer', '$state', '$cordovaFile', '$cordovaFileOpener2',
        function($http, $q, $ionicScrollDelegate, $rootScope, $timeout, $ionicLoading, $document, $ionicPlatform, $compile, $ionicModal, $ionicPopup, $cordovaFileTransfer, $state, $cordovaFile, $cordovaFileOpener2){
        var isLoacl = location.href.indexOf('localhost') > -1;
        return{
            post: (function(){
               return function(cmd, func, data, hideError, isSerial){

                   angular.forEach(data, function(val, key){
                      data[key] = val + '';
                   })

                   var This = this,
                       tempData = null,
                       registrationId = This.localStorageHandle('registrationId'),
                       deferred = $q.defer(),
                       accountData,
                       networkStatus,
                       json = {
                           cmd: cmd + '',
                           func: func,
                           machId: registrationId || (window.device && device.uuid),
                           token: this.userBaseMsg.token || '',
                           msg: data || {}
                       };

                   // 如果cmd是对象
                   if (cmd.cmd) {
                       json = cmd;
                   }

                   /**
                    * 检测当前网络
                    */
                   function checkConnection() {

                       if (!json.machId || !navigator.connection) {

                           return null;
                       }

                       var networkState = navigator.connection.type,
                           states = {};
                       states[Connection.UNKNOWN]  = 'Unknown connection';
                       states[Connection.ETHERNET] = 'Ethernet connection';
                       states[Connection.WIFI]     = 'WiFi connection';
                       states[Connection.CELL_2G]  = 'Cell 2G connection';
                       states[Connection.CELL_3G]  = 'Cell 3G connection';
                       states[Connection.CELL_4G]  = 'Cell 4G connection';
                       states[Connection.CELL]     = 'Cell generic connection';
                       states[Connection.NONE]     = 'No network connection';


                       return states[networkState]
                   }

                   networkStatus = checkConnection();
                   $rootScope.isOffLine = false;
                   // 没有连接互联网
                   if (networkStatus == 'No network connection') {
                       deferred.resolve({isOffLine: true});
                       $rootScope.isOffLine = true;

                       This.errorPrompt('网络连接失败!');
                       return deferred.promise;
                   }

                   if (json.machId) {

                       http.httpsPost('https://interface.icaimi.com/interface', json, function(re){

                           re = JSON.parse(re);

                           responseHandle(deferred, re);

                       }, function(re){

                           deferred.reject(re);
                           // 提示错误
                           !hideError && This.errorPrompt(re.msg);
                       })

                   } else {


                       $http({
                           url: isLoacl ? '/' : '/h5/interface',
                           method: isLoacl ? 'get' : 'post',
                           data: {msg: json},
                           headers: {
                               'Content-Type': 'application/x-www-form-urlencoded'
                           }
                       }).success(function(data, status){
                           responseHandle(deferred, data);
                       }).error(function(re){
                         deferred.reject(re);
                         // 提示错误
                         !hideError && This.errorPrompt(re.msg);
                       })

                   }
                   return deferred.promise;

                 /**
                  * 解析返回的数据
                  * @param deferred
                  * @param data
                  */
                   function responseHandle(deferred, data) {

                        if (typeof data == 'string') {
                          data = {};
                          data.code = '0000'
                        }
                       // 未登录
                       if (data.code == '0008') {
                           tempData = json;
                           accountData = This.localStorageHandle('account');

                           if (accountData) {
                               This.signIn(accountData, function(re){

                                   if (re.token) {
                                       tempData.token = re.token;
                                       This.post(tempData).then(function(re){
                                         deferred.resolve(re);
                                       })
                                   } else {
                                       $state.go('tab.login');
                                   }

                               })
                           } else {
                               $state.go('tab.login');
                           }


                       } else if (data.code === '0000') {
                           deferred.resolve(data.result);
                       } else {
                          deferred.reject(data);
                           // 提示错误
                           !hideError &&  This.errorPrompt(data.msg);
                       }
                   }
               }
            }()),
            serialPost: function(cmd, func, data, hideError){

                var bBtn = true,
                  deferred = $q.defer();

                if (bBtn) {
                  bBtn = false;
                   this.post(cmd, func, data, hideError).then(function(re){
                     deferred.resolve(re);
                     bBtn = true;
                  }, function(re){

                     deferred.reject(re);
                     bBtn = true;
                  });
                  return deferred.promise;
                }


            },

            // 处理顶部导航条
            handleHeader: function() {

                $timeout(function(){

                    if ($ionicScrollDelegate.getScrollPosition().top < 0 ) {
                        $rootScope.$broadcast('header.hide');
                    } else {
                        $rootScope.$broadcast('header.show');
                    }
                    $rootScope.$digest();
                }, 100)

            },

            // 用户信息
            userBaseMsg: {},

            // 设置用户信息
            setUserBaseMsg: function(msg){
                this.userBaseMsg = msg;
            },

            // 是不是空对象
            isEmptyObject: function(obj){

                for (var i in obj) {
                    return false;
                }
                return true;
            },
            cacheData: {},
            cache: function(sign, data){

                if (data != undefined) {
                    if (angular.isArray(this.cacheData[sign])) {
                        this.cacheData[sign] = this.cacheData[sign].concat(data);
                    } else {
                        this.cacheData[sign] = data;
                    }
                } else {
                    return this.cacheData[sign];
                }

            },

            // 错误提示
            errorPrompt: function(msg){

                var html = '<div class="error-prompt">' + msg + '</div>';

                var promptDom = angular.element(html);

                $document.find('body').append(promptDom);

                $timeout(function(){
                    promptDom.remove();
                }, 2000)
            },

            // 选择
           selectPrompt: function(obj){

                var html = window.device ? '<div class="prompt-bottom"><div class="list"><div ng-repeat="i in data" class="item" ng-click="appect(i.sign)">{{i.text}}</div></div><div class="list"><div class="item"  ng-click="cancel()">取消</div></div></div>' :
                  '<div class="prompt-bottom"><div class="list"><div class="item">上传图像<form><input type="file" name="file" onchange="appect(this)"/></form></div></div><div class="list"><div class="item"  ng-click="cancel()">取消</div></div></div>';

                var promptDom = angular.element(html),
                    scope = $rootScope.$new();

                scope.data =  obj.func;

                appect = scope.appect = function(sign){
                    obj.accept(sign);
                    scope.cancel();
                };

                scope.cancel= function(){
                    promptDom.remove();
                    if (obj.cancel) obj.cancel();
                }


                $document.find('body').append(promptDom);
                $compile(promptDom)(scope);

                return scope.cancel;
           },
            /**
             * 处理缓存
             * @param sign {String or Object} 缓存的key 注：取数据时格式可以以{key: 'sign', page: 1, pageSize: 10} 格式取指定的数据
             * @param data {Object} 缓存的数据
             * @param isPush {Boolean} 是不是追加数据
             * @returns {*} {Object} 返回的数据
             */
            localStorageHandle: function(sign, data, isPush){

                var result,
                    key = sign.key || sign,
                    start = sign.page || 0,
                    end = sign.pageSize || 10;

                if (data != undefined) {

                    if (isPush) {
                        result = JSON.parse(localStorage.getItem(key));

                        if (angular.isArray(result)) {
                            data = result.concat(data);
                        } else if (!this.isEmptyObject(result)) {
                            angular.extend(data, result);
                        }
                    }
                    try {

                      localStorage.setItem(sign, JSON.stringify(data));

                    } catch (e) {

                    }

                } else {
                    try {

                        result = JSON.parse(localStorage.getItem(key));

                        if (angular.isArray(result)) {

                            result = result.slice(start * end, start * end + end);

                        }
                    } catch(e){

                    } finally{
                        return result;
                    }

                }
           },
            /**
             * 是否登录
             * @returns {*|options.token|{type, shorthand}|null}
             */
            isSignIn: function(){
                return this.userBaseMsg.token;
            },
            /**
             * 登录
             * @param data {Object} 用户名密码
             * @param fn {Function} 回调函数
             * @param hideError {Boolean} 是否隐藏错误提示
             */
            signIn: function(data, fn, hideError){

                var This = this;

                if (data && data.mobile) {
                    this.post('3101', 'password', data, hideError).then(function(re){
                        This.setUserBaseMsg(re);
                        if (fn) fn(re);
                    }, function(re){
                        if (fn) fn(re);
                    })
                }

            },
            /**
             * 自动登录
             * @param account {Object} 用户信息
             * @param fn {Function} 回调函数
             */
            autoSignin: function(account, fn){

                if (!this.isSignIn()){
                    this.signIn(account, fn, true);
                } else {
                    fn && fn();
                }
            },
            /**
             * 系统更新
             */
            updateAPP: function(){

                var sid,
                    This = this;

                //if (typeof http != 'undefined') {
                //
                //    http.getSid(function(sid){
                //
                //        sid = sid;
                //        checkUpdate(sid);
                //    })
                //}
              checkUpdate();
                // 检查更新
                function checkUpdate(sid) {

                    This.post('1000', 'version').then(function(re){

                        // 更新
                        if (re.status == 2) {

                            $ionicPopup.show({
                                template: '<p class="c-333 fs-15" style="margin: 20px 5px 23px;">' + re.updateInfo + '</p>',
                                title: '版本更新提示',
                                buttons: [
                                    {text: '取消'},
                                    {
                                        text: '确定',
                                        type: 'c-red',
                                        onTap: function (e) {
                                            updateHandle(re);
                                        }
                                    }
                                ]
                            });
                        }
                        // 强制更新
                        else if (re.status == 3) {
                            $ionicPopup.show({
                                template: '<p class="c-333 fs-15" style="margin: 20px 5px 23px;">' + re.updateInfo + '</p>',
                                title: '版本更新提示',
                                buttons: [
                                    {
                                        text: '确定',
                                        type: 'c-red',
                                        onTap: function (e) {
                                            updateHandle(re);
                                        }
                                    }
                                ]
                            });
                        }
                    })
                }

                function updateHandle(result) {


                    var url = result.downUrl || 'http://newapp.icaimi.com/apk/android-8000.apk',
                        options = {},
                        targetPath = cordova.file.externalRootDirectory + '/caimizhitou/com.icaimi.lottery.apk',
                        trustHosts = true,
                        progressed;

                    $cordovaFile.checkDir(cordova.file.externalRootDirectory, 'caimizhitou').then(function(re){

                        $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
                            .then(function(result) {

                                This.localStorageHandle('start', false);
                                $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive')
                                    .then(function () {


                                    }, function (err) {

                                    });
                            }, function(err) {
                                $ionicLoading.show({template: '下载失败！', noBackdrop: true, duration: 2000});
                            }, function (progress) {
                                setTimeout(function () {
                                    progressed = (progress.loaded / progress.total) * 100;

                                    $ionicLoading.show({
                                        template: '已经下载' + Math.floor(progressed) + '%'
                                    });
                                    if (progressed > 99) {
                                        $ionicLoading.hide();
                                    }
                                }, 100);
                            });

                    }, function(re){

                        $cordovaFile.createDir(cordova.file.externalRootDirectory, "caimizhitou", false)
                            .then(function (success) {
                                $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
                                    .then(function(result) {

                                        This.localStorageHandle('start', false);
                                        $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive')
                                            .then(function () {



                                            }, function (err) {

                                            });
                                    }, function(err) {
                                        $ionicLoading.show({template: '下载失败！', noBackdrop: true, duration: 2000});
                                    }, function (progress) {
                                        setTimeout(function () {
                                            progressed = (progress.loaded / progress.total) * 100;

                                            $ionicLoading.show({
                                                template: '已经下载' + Math.floor(progressed) + '%'
                                            });
                                            if (progressed > 99) {
                                                $ionicLoading.hide();
                                            }
                                        }, 100);
                                    });

                            }, function (error) {
                                alert('sd卡读写错误')
                            });

                    })
                }

            },
            /**
             * 存储本地文件
             * @param sign {String} 缓存的key
             * @param msg {String} 缓存的内容
             */
            cacheSD: function(sign, msg){

                var deferred = $q.defer();

                // 判断是不是文件
                $cordovaFile.checkFile(cordova.file.dataDirectory, sign)
                    .then(function (success) {

                        if (!msg) {
                            readFile(success);
                        } else {
                            writeFile();
                        }

                    }, function (error) {
                        writeFile();
                    });
                return deferred.promise;

                function writeFile(){
                    $cordovaFile.writeFile(cordova.file.dataDirectory, sign, msg, true)
                        .then(function (success) {
                            deferred.resolve(success);
                        }, function (error) {
                            deferred.reject(success);
                        });

                }
                function readFile(success){
                    $cordovaFile.readAsText(cordova.file.dataDirectory, success.name)
                        .then(function (success) {
                            deferred.resolve(success);
                        }, function (error) {
                            deferred.reject(success);
                        });

                }
            },
            preImage: function(imgArr){
                var oImg = null;
                angular.forEach(imgArr, function(img){
                    "use strict";
                    oImg = new Image();

                    oImg.src = img;
                })

            },

          /**
           * 序列化开奖信息
           * @param lotteryList {Array}
           * @returns {Array}
           */
          serializeLottery: function(lotteryList){
            var This = this,
              lotteryCode;

            if (!angular.isArray(lotteryList)) return [];

            angular.forEach(lotteryList, function(issue){
              lotteryCode = issue.lotteryCode;

              // 处理开奖号码
              issue.bonusNumber = This.sliceNum(issue.bonusNumber);

              // 处理时间
              try{
                issue.bonusTime = issue.bonusTime.split(' ')[0];

              } catch(e){

              }

            })



            return lotteryList;
          },
          // 截取红篮球
          sliceNum: function(str){


            var firstSliceArr = [],
              result = [],
              blueArr = [];

            if (typeof str !== 'string') return result;

            if (str.indexOf('#') != -1) {
              firstSliceArr = str.split('#');

              // 循环切割的数组
              angular.forEach(firstSliceArr, function(numArr, index){

                // 红球不区分
                if (index == 0) {
                  result = numArr.split(',');
                } else {

                  // 篮球
                  blueArr = numArr.split(',');

                  angular.forEach(blueArr, function(num){

                    result.push({blueBool: num})
                  })
                }

              })
            } else {

              // 如果没有开奖号码
              if (!str || str == '-') {
                return '';
              }

              result = str.split(',');
            }
            return result;
          }
        }

    }])


