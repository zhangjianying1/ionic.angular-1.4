var exec = require('cordova/exec');

var http = {
    httpPost: function (url, msg, success, error) {
        exec(success, error, "Http", "httpPost", [url, msg]);
    },
    httpsPost: function (url, msg, success, error) {
        exec(success, error, "Http", "httpsPost", [url, msg]);
    },
    getSid: function (success, error) {
        exec(success, error, "Http", "getSid", []);
    }
};

module.exports = http;