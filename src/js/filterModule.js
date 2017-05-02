//
angular.module('starter.filters', []).
    filter('reduce', function(){

        return function(val){

            return val.reduce(function(a, b){

                return Number(a) + Number(b);
            })
        }
    })
    // 日期格式化 2014-10-11 转换为 2014.10.11
    .filter('datetransfer', function(){
        return function(val) {
            return val.replace(/-/g, '.');
        }
    })
    // 日期格式化 2014-10-11 20:20:20 转换为 2014-10-11
    .filter('dateshort', function(){
        return function(val) {
            return val.split(' ')[0];
        }
    })
    //  期次简化 为六位
    .filter('issuefixed', function(){
      return function(val) {
        return val.slice(-5);
      }
    })
    // 取整
    .filter('parseInt', function(){
      return function(val) {
        return parseInt(val);
      }
    })
  // 取整
  .filter('repair', function(){
    return function(val) {
      val += '';
      if (val.length < 2) {
        return '0' + val;
      } else {
        return val;
      }

    }
  })

