var exec = require('cordova/exec');


module.exports = {
    getVersionCode: function(onSuccess,onError){
        exec(onSuccess, onError, "Upgrade", "getVersionCode");
    },
};