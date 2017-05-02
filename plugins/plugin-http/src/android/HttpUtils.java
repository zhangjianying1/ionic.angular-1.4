package com.icaimi.cordova.plugin;

import com.zhy.http.okhttp.OkHttpUtils;
import com.zhy.http.okhttp.builder.GetBuilder;
import com.zhy.http.okhttp.builder.PostFormBuilder;
import com.zhy.http.okhttp.callback.StringCallback;
import com.zhy.http.okhttp.https.HttpsUtils;
import okhttp3.OkHttpClient;
import okhttp3.Call;

import okhttp3.Response;
import org.apache.cordova.CallbackContext;


import java.io.IOException;
import java.util.Map;

/**
 * 作者: 邓玉明
 * 时间: 16/7/25 下午7:43
 * email:cndym@163.com
 */
public class HttpUtils {

    public static boolean httpsPost(String url, Map<String, String> param, final CallbackContext callbackContext) {
        String reBody = null;
        try {
            HttpsUtils.SSLParams sslParams = HttpsUtils.getSslSocketFactory(null, null, null);
            OkHttpClient okHttpClient = new OkHttpClient.Builder().sslSocketFactory(sslParams.sSLSocketFactory).build();
            OkHttpUtils.initClient(okHttpClient);

            PostFormBuilder postFormBuilder = OkHttpUtils.post();
            postFormBuilder.url(url);
            if (null != param) {
                for (Map.Entry<String, String> entry : param.entrySet()) {
                    postFormBuilder.addParams(entry.getKey(), entry.getValue());
                }
            }
            postFormBuilder.build().execute(new StringCallback() {
                @Override
                public void onError(Call call, Exception e, int i) {
                    callbackContext.error(e.getMessage());
                }

                @Override
                public void onResponse(String s, int i) {
                    callbackContext.success(s);
                }
            });
            return true;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }


    public static boolean httpPost(String url, Map<String, String> param, final CallbackContext callbackContext) {
        try {
            PostFormBuilder postFormBuilder = OkHttpUtils.post();
            postFormBuilder.url(url);
            if (null != param) {
                for (Map.Entry<String, String> entry : param.entrySet()) {
                    postFormBuilder.addParams(entry.getKey(), entry.getValue());
                }
            }
            postFormBuilder.build().execute(new StringCallback() {
                @Override
                public void onError(Call call, Exception e, int i) {
                    callbackContext.error(e.getMessage());
                }

                @Override
                public void onResponse(String s, int i) {
                    callbackContext.success(s);
                }
            });
            return true;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    public static boolean httpGet(String url, Map<String, String> param, final CallbackContext callbackContext) {
        try {
            GetBuilder getBuilder = OkHttpUtils.get();
            getBuilder.url(url);
            if (null != param) {
                for (Map.Entry<String, String> entry : param.entrySet()) {
                    getBuilder.addParams(entry.getKey(), entry.getValue());
                }
            }
            getBuilder.build().execute(new StringCallback() {
                @Override
                public void onError(Call call, Exception e, int i) {
                    callbackContext.error(e.getMessage());
                }

                @Override
                public void onResponse(String s, int i) {
                    callbackContext.success(s);
                }
            });
            return true;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
}
