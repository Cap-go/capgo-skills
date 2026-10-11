# Official plugin breaking changes in Capacitor 6

Source: https://capacitorjs.com/docs/updating/6-0#plugins. Update all `@capacitor/*` plugins to `^6.0.0`.

## All plugins with listeners

`addListener` returns only `Promise<PluginListenerHandle>`.

```diff
-const handle = App.addListener('resume', onResume);
+const handle = await App.addListener('resume', onResume);
 handle.remove();
```

## Per plugin

| Plugin | Change |
| --- | --- |
| Action Sheet | `androidxMaterialVersion = '1.10.0'` |
| Camera | Uses Android Photo Picker. Without `saveToGallery: true`, `READ_MEDIA_IMAGES`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` can be removed if no other plugin needs them. Gallery cancel error on Android is now `"User cancelled photos app"`. `androidxMaterialVersion = '1.10.0'` |
| Filesystem | iOS returns `ctime` and `mtime` as numbers |
| Geolocation | `NSLocationAlwaysUsageDescription` deprecated, can be removed from `Info.plist`. `playServicesLocationVersion = '21.1.0'` |
| Google Maps | iOS native libs updated (see plugin docs). `NSLocationAlwaysUsageDescription` removable. `googleMapsPlayServicesVersion = '18.2.0'`, `googleMapsUtilsVersion = '3.8.2'`, `googleMapsKtxVersion = '5.0.0'`, `googleMapsUtilsKtxVersion = '5.0.0'`, `kotlinxCoroutinesVersion = '1.7.3'`, `androidxCoreKTXVersion = '1.12.0'`, `kotlin_version = '1.9.10'` |
| Local Notifications | Android 14: notifications are not exact by default even with `SCHEDULE_EXACT_ALARM`; see plugin docs |
| Push Notifications | `firebaseMessagingVersion = '23.3.1'` |
| Share | `androidxCoreVersion = '1.12.0'` |
| Splash Screen | `coreSplashScreenVersion = '1.0.1'` |
| Status Bar | `androidxCoreVersion = '1.12.0'` |

## Leftover greps

```bash
grep -rnE "= *[A-Za-z]+\.addListener\(" src/ | grep -v await
grep -rn "ctime\|mtime" src/
grep -rn "User cancelled" src/
```
