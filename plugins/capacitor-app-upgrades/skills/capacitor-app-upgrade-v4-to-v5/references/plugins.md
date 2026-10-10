# Official plugin breaking changes in Capacitor 5

Source: https://capacitorjs.com/docs/updating/5-0#plugins. Update all `@capacitor/*` plugins to `^5.0.0`. Variables go in `android/variables.gradle`.

| Plugin | Change |
| --- | --- |
| Action Sheet | `androidxMaterialVersion = '1.8.0'` |
| Browser | `androidxBrowserVersion = '1.5.0'` |
| Camera | Add `<uses-permission android:name="android.permission.READ_MEDIA_IMAGES"/>` to `AndroidManifest.xml` (Android 13). `androidxMaterialVersion = '1.8.0'`, `androidxExifInterfaceVersion = '1.3.6'` |
| Device | `DeviceId.uuid` renamed to `DeviceId.identifier`. On iOS 16+, `DeviceInfo.name` is generic unless the app has the user-assigned-device-name entitlement |
| Geolocation | `playServicesLocationVersion = '21.0.1'` |
| Google Maps | `googleMapsPlayServicesVersion = '18.1.0'`, `googleMapsUtilsVersion = '3.4.0'`, `googleMapsKtxVersion = '3.4.0'`, `googleMapsUtilsKtxVersion = '3.4.0'`, `kotlinxCoroutinesVersion = '1.6.4'`, `androidxCoreKTXVersion = '1.10.0'`, `kotlin_version = '1.8.20'` |
| Local Notifications | Android 13 runtime permission: call `checkPermissions()` / `requestPermissions()` before scheduling |
| Push Notifications | Android 13 runtime permission: call `checkPermissions()` / `requestPermissions()` before registering. `firebaseMessagingVersion = '23.1.2'` |
| Status Bar | iOS default animation is now `FADE` |

## Leftover greps

```bash
grep -rn "\.uuid" src/ | grep -i device
grep -rn "PushNotifications.register\|LocalNotifications.schedule" src/   # each path must request permission first
```
