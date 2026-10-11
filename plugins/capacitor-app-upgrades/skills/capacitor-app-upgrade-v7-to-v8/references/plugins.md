# Official plugin breaking changes in Capacitor 8

Source: https://capacitorjs.com/docs/updating/8-0#plugins. Update all `@capacitor/*` plugins to `^8.0.0`.

| Plugin | Change |
| --- | --- |
| Action Sheet | `androidxMaterialVersion = '1.13.0'` |
| Barcode Scanner | `scanOrientation` is ignored on large screens (tablets) on Android 16+. Temporary opt-out (stops working on Android 17): `<property android:name="android.window.PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY" android:value="true" />` inside `<application>` or `<activity>` |
| Browser | `androidxBrowserVersion = '1.9.0'` |
| Camera | `androidxExifInterfaceVersion = '1.4.1'`, `androidxMaterialVersion = '1.13.0'` |
| Geolocation | `timeout` now applies to all requests on Android and iOS. Raise `timeout` if requests start failing. Android `watchPosition` gains an `interval` option. `kotlinxCoroutinesVersion = '1.10.2'` |
| Google Maps | `googleMapsPlayServicesVersion = '19.2.0'`, `googleMapsUtilsVersion = '3.19.1'`, `googleMapsKtxVersion = '5.2.1'`, `googleMapsUtilsKtxVersion = '5.2.1'`, `kotlinxCoroutinesVersion = '1.10.2'`, `androidxCoreKTXVersion = '1.17.0'`, `kotlin_version = '2.2.20'` |
| Push Notifications | `firebaseMessagingVersion = '25.0.1'` |
| Screen Orientation | `lock()` has no effect on large screens on Android 16+. Same temporary opt-out property as Barcode Scanner |
| Splash Screen | `coreSplashScreenVersion = '1.2.0'` |
| Status Bar | Removed its `CAPNotifications.swift` / `CAPBridgeViewController.swift` that emitted `.capacitorViewDidAppear` and `.capacitorViewWillTransition`; these now come from `@capacitor/ios` |

## Large-screen orientation

Android discourages fixed orientation on large screens. Prefer responsive layouts over the opt-out property; it is temporary.

## Leftover greps

```bash
grep -rn "getCurrentPosition\|watchPosition" src/ | grep -v timeout   # review timeouts
grep -rn "ScreenOrientation.lock\|scanOrientation" src/
```
