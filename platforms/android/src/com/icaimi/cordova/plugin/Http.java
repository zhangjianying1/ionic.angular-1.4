package com.icaimi.cordova.plugin;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.util.Log;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.*;

/**
 * This class echoes a string called from JavaScript.
 */
public class Http extends CordovaPlugin {

    private String catString = "ncde8fghiCDEFwNsyz0124GFLVUWH2G4stuvVwNIJKGFLVabcddG5BHGQRyz0W57qre9ApGFLVGOP124USe879ABfg24MNdIJKLlmGnoMSTQRrstuvhGiCDEYZ3MNjo3pqMSTsGjk6GeOPSYZ";

    private Context context;
    private PackageInfo packageInfo = null;
    private ApplicationInfo applicationInfo = null;

    public static final String TAG = "Cordova.Plugin.Http";

    @Override
    protected void pluginInitialize() {
        super.pluginInitialize();
        context = cordova.getActivity();
        PackageManager packageManager = context.getPackageManager();
        String packageName = context.getPackageName();
        try {
            packageInfo = packageManager.getPackageInfo(packageName, 0);
            applicationInfo = packageManager.getApplicationInfo(packageName, PackageManager.GET_META_DATA);
        } catch (Exception e) {
            e.printStackTrace();
            try {
                packageInfo = packageManager.getPackageInfo(packageName, 0);
                applicationInfo = packageManager.getApplicationInfo(packageName, PackageManager.GET_META_DATA);
            } catch (Exception e1) {
                e1.printStackTrace();
                Log.e(TAG, e1.getMessage());
            }
        }
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("httpPost")) {
            String url = args.getString(0);
            JSONObject jsonObject = args.getJSONObject(1);
            Log.i(TAG, "msg: " + jsonObject.toString());
            this.httpPost(url, jsonObject, callbackContext);
            return true;
        } else if (action.equals("httpsPost")) {
            String url = args.getString(0);
            JSONObject jsonObject = args.getJSONObject(1);
            Log.i(TAG, "msg: " + jsonObject.toString());
            this.httpsPost(url, jsonObject, callbackContext);
            return true;
        } else if (action.equals("getSid")) {
            callbackContext.success(getSid());
            return true;
        }
        return false;
    }

    private void httpPost(String url, JSONObject jsonObject, CallbackContext callbackContext) {
        try {
            if (jsonObject != null && jsonObject.length() > 0) {
                String cmd = jsonObject.getString("cmd");
                String func = jsonObject.getString("func");
                String token = jsonObject.getString("token");
                String machId = jsonObject.getString("machId");
                JSONObject msgObject = jsonObject.getJSONObject("msg");
                Map<String, String> paramMap = new HashMap<String, String>();
                paramMap.put("msg", buildMsg(cmd, func, token, machId, msgObject));
                HttpUtils.httpPost(url, paramMap, callbackContext);
            } else {
                callbackContext.error("Expected one non-empty string argument.");
            }
        } catch (Exception e) {
            callbackContext.error("error: " + e.getMessage());
        }
    }

    public String md5MsgStr(JSONObject jsonObject) {

        try {
            List<String> keyList = new ArrayList<String>();
            for (Iterator<String> it = jsonObject.keys(); it.hasNext(); ) {
                keyList.add(it.next());
            }
            Collections.sort(keyList);
            StringBuilder sb = new StringBuilder();
            for (String key : keyList) {
                sb.append(key).append("=").append(jsonObject.get(key));
            }
            return sb.toString();
        } catch (Exception e) {
            return jsonObject.toString();
        }
    }

    private void httpsPost(String url, JSONObject jsonObject, CallbackContext callbackContext) {
        try {
            if (jsonObject != null && jsonObject.length() > 0) {
                String cmd = jsonObject.getString("cmd");
                String func = jsonObject.getString("func");
                String token = jsonObject.getString("token");
                String machId = jsonObject.getString("machId");
                JSONObject msgObject = jsonObject.getJSONObject("msg");
                Map<String, String> paramMap = new HashMap<String, String>();
                paramMap.put("msg", buildMsg(cmd, func, token, machId, msgObject));
                HttpUtils.httpsPost(url, paramMap, callbackContext);
            } else {
                callbackContext.error("Expected one non-empty string argument.");
            }
        } catch (Exception e) {
            callbackContext.error("error: " + e.getMessage());
        }
    }

    private String getMd5String(String cmd, String machId, String msg) {
        StringBuilder sbBuilder = new StringBuilder();
        sbBuilder.append(cmd)
                .append(getIp())
                .append(machId)
                .append(getMachName())
                .append(msg)
                .append(getPlatform())
                .append(getSid())
                .append(getSoftVer())
                .append(getSysVer())
                .append(getSidMd5(getSid()));
        String md5Str = sbBuilder.toString();
        Log.i(TAG, "Md5Str: " + md5Str);
        final String md5Encode = Md5.md5(md5Str).toLowerCase();
        return md5Encode;
    }

    private String getSidMd5(String sid) {
        String sidKey = String.valueOf(applicationInfo.metaData.get("SID_KEY"));
        if (sidKey != null && !sidKey.equals("")) {
            catString = sidKey;
        }
        String md5key = Md5.md5(sid);
        StringBuilder sb = new StringBuilder();
        for (char s : md5key.toCharArray()) {
            int index = (int) (s - '0');
            sb.append(catString.charAt(index));
        }
        return sb.toString();
    }

    private String buildMsg(String cmd, String func, String token, String machId, JSONObject jsonObject) {
        try {
            JSONObject paramObject = new JSONObject();
            paramObject.put("sid", getSid());
            paramObject.put("platform", getPlatform());
            paramObject.put("cmd", cmd);
            paramObject.put("func", func);
            paramObject.put("machId", machId);
            paramObject.put("machName", getMachName());
            paramObject.put("softVer", getSoftVer());
            paramObject.put("sysVer", getSysVer());
            paramObject.put("token", token);
            paramObject.put("ip", getIp());
            paramObject.put("md5", getMd5String(cmd, machId, md5MsgStr(jsonObject)));
            paramObject.put("msg", jsonObject);
            return paramObject.toString();
        } catch (Exception e) {
        }
        return "";
    }


    private String getSid() {
        String sid = String.valueOf(applicationInfo.metaData.get("SID"));
        if (sid == null || sid.equals("")) {
            sid = "80001";
        }
        return sid;
    }

    private String getPlatform() {
        return "01";
    }

    private String getMachName() {
        return android.os.Build.MODEL;
    }

    private String getSoftVer() {
        return packageInfo.versionName;
    }

    private String getSysVer() {
        return "android " + Build.VERSION.RELEASE;
    }

    private static String intToIp(int i) {
        return (i & 0xFF) + "." +
                ((i >> 8) & 0xFF) + "." +
                ((i >> 16) & 0xFF) + "." +
                (i >> 24 & 0xFF);
    }

    private String getIp() {
        WifiManager wifiManager = (WifiManager) context.getSystemService(Context.WIFI_SERVICE);
        String ip = "";
        if (wifiManager.isWifiEnabled()) {
            WifiInfo wifiInfo = wifiManager.getConnectionInfo();
            int ipAddress = wifiInfo.getIpAddress();
            ip = intToIp(ipAddress);
        }
        return ip;
    }
}