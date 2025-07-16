// FaceAuthModule.java
package com.example.pyengine;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.chaquo.python.Python;
import com.chaquo.python.android.AndroidPlatform;

public class FaceAuthModule extends ReactContextBaseJavaModule {
    private final Python py;

    public FaceAuthModule(ReactApplicationContext reactContext) {
        super(reactContext);
        if (! Python.isStarted()) {
            Python.start(new AndroidPlatform(reactContext));
        }
        py = Python.getInstance();
    }

    @Override
    public String getName() {
        return "FaceAuth";
    }

    @ReactMethod
    public void enroll(String userId, String name, String imageB64, Promise promise) {
        try {
            String result = py.getModule("face_module")
                    .callAttr("enroll", userId, name, imageB64)
                    .toString();
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ENROLL_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void verify(String imageB64, Promise promise) {
        try {
            String result = py.getModule("face_module")
                    .callAttr("verify", imageB64)
                    .toString();
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("VERIFY_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void clearAll(Promise promise) {
        try {
            String result = py.getModule("face_module")
                    .callAttr("clear_all")
                    .toString();
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("CLEAR_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void listAll(Promise promise) {
        try {
            String result = py.getModule("face_module")
                    .callAttr("list_all")
                    .toString();
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("LIST_ERROR", e.getMessage());
        }
    }
}
