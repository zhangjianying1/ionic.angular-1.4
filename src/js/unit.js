(function(window){
  function Unit(){}

  Unit.prototype = {
    /**
     * 获取
     * @param str
     * @param re
     * @returns {*}
     */
    getPattren: function(str, re){
      var result;
      try{
        result = re.exec(str);
      } catch(e) {

      }

      return result && result[1];
    },
    /**
     * 排序从小到大
     * @param arr
     */
    sortNumber: function (arr){
      return arr.sort(function(a, b){
        return Number(a) > Number(b);
      })
    }

  }




  window.unit = new Unit();
}(window))


