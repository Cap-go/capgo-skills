# Android API Removals (Capacitor 9)

Source: https://capacitorjs.com/docs/updating/plugins/9-0#android. Pattern background: https://capacitorjs.com/docs/updating/plugins/3-0

The `@NativePlugin` annotation and several deprecated permission and activity-result APIs from that era have been removed. For the overall migration pattern, see the [Capacitor 3 plugin migration guide](/updating/plugins/3-0).

| Removed | Replacement |
| :------ | :---------- |
| `@NativePlugin` annotation | `@CapacitorPlugin` |
| `Plugin.saveCall(PluginCall)` | `Bridge.saveCall(PluginCall)` or `PluginCall.setKeepAlive(true)` |
| `Plugin.getSavedCall()` (no-arg) | `Bridge.getSavedCall(String)` |
| `Plugin.freeSavedCall()` | `PluginCall.release(Bridge)` |
| `Plugin.hasDefinedPermissions(String[])` | `Plugin.isPermissionDeclared(String)` |
| `Plugin.hasPermission(String)` | `Plugin.getPermissionState(String)` / `getPermissionStates()`, or `ActivityCompat.checkSelfPermission(Context, String)` |
| `Plugin.pluginRequestPermission(String, int)` | `Plugin.requestPermissionForAlias(...)` with `@PermissionCallback` |
| `Plugin.pluginRequestPermissions(String[], int)` | `Plugin.requestPermissionForAliases(...)` with `@PermissionCallback` |
| `Plugin.pluginRequestAllPermissions()` | `Plugin.requestAllPermissions(PluginCall, String)` with `@PermissionCallback` |
| `Plugin.startActivityForResult(PluginCall, Intent, int)` | `Plugin.startActivityForResult(PluginCall, Intent, String)` with `@ActivityCallback` |
| `Bridge.startActivityForPluginWithResult(PluginCall, Intent, int)` | `Plugin.startActivityForResult(PluginCall, Intent, String)` with `@ActivityCallback` |

Capacitor 9 also removes the remaining Java APIs that were deprecated in previous major versions. If your plugin still uses any of them, replace them as follows:

| Removed | Replacement |
| :------ | :---------- |
| `CapConfig(AssetManager, JSONObject)` constructor | `CapConfig.loadDefault(Context)` to load from `capacitor.config.json`, or `CapConfig.Builder` for embedded use |
| `CapConfig.getObject(String)`, `getString(...)`, `getBoolean(...)`, `getInt(...)`, `getArray(...)` | The typed getters on `CapConfig` for main config values and the `PluginConfig` accessors for plugin config values |
| `PluginCall.save()` | `setKeepAlive(true)` |
| `PluginCall.isSaved()` | `isKeptAlive()` |
| `PluginCall.hasOption(String)` | Typed accessors (`getString(...)`, `getInt(...)`, etc.) |
| `PluginCall.isReleased()` | No replacement, released calls are managed by the bridge |
| `Bridge.CAPACITOR_HTTPS_INTERCEPTOR_START` | `CAPACITOR_HTTP_INTERCEPTOR_START`, all proxied requests are handled by it |
| `Plugin.getConfigValue(String)` | `getConfig()` and the typed accessors on `PluginConfig` |
| `MessageHandler(Bridge, WebView, Object)` constructor | `MessageHandler(Bridge, WebView)` |
| `WebViewLocalServer.PathHandler.getResponseHeaders()` | `buildDefaultResponseHeaders()` |

## Find hits

```bash
grep -rn --include=*.java --include=*.kt -E '@NativePlugin|\bsaveCall\(|getSavedCall\(\)|freeSavedCall\(|hasDefinedPermissions|\bhasPermission\(|pluginRequestPermission|pluginRequestAllPermissions|startActivityForPluginWithResult|startActivityForResult\([^,]+,[^,]+,\s*[0-9A-Z_]+\)|\.save\(\)|isSaved\(\)|hasOption\(|isReleased\(\)|CAPACITOR_HTTPS_INTERCEPTOR_START|getConfigValue\(|new CapConfig\(|getResponseHeaders\(\)|com\.getcapacitor\.cordova' android/src
```

`.save()` and `startActivityForResult` patterns over-match; read each hit.

## Typical rewrites

Permissions (pre-v3 style -> alias + callback):

```java
@CapacitorPlugin(
    name = "MyPlugin",
    permissions = { @Permission(alias = "camera", strings = { Manifest.permission.CAMERA }) }
)
public class MyPlugin extends Plugin {
    @PluginMethod
    public void takePhoto(PluginCall call) {
        if (getPermissionState("camera") != PermissionState.GRANTED) {
            requestPermissionForAlias("camera", call, "cameraPermsCallback");
            return;
        }
        doTakePhoto(call);
    }

    @PermissionCallback
    private void cameraPermsCallback(PluginCall call) {
        if (getPermissionState("camera") == PermissionState.GRANTED) doTakePhoto(call);
        else call.reject("Permission is required to take a picture");
    }
}
```

Activity results (int request code -> named callback):

```java
startActivityForResult(call, intent, "pickResult");

@ActivityCallback
private void pickResult(PluginCall call, ActivityResult result) {
    if (call == null) return;
    // read result.getResultCode(), result.getData()
}
```

Kept-alive calls (listeners, watchers): `call.setKeepAlive(true)` instead of `saveCall(call)` / `call.save()`; later `bridge.getSavedCall(callbackId)` and `call.release(bridge)` when done.

Config: `getConfig().getString("key", default)` (plugin config via `PluginConfig`) instead of `getConfigValue("key")`.
